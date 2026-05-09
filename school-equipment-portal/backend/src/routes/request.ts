import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Get user's requests
router.get('/my-requests', authenticate, async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.borrowRequest.findMany({
      where: { userId: req.userId },
      include: { equipment: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all requests (Admin/Staff only)
router.get('/all', 
  authenticate,
  authorize('ADMIN', 'STAFF'),
  async (req, res) => {
    try {
      const requests = await prisma.borrowRequest.findMany({
        include: {
          user: { select: { name: true, email: true, role: true } },
          equipment: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Create borrow request
router.post('/',
  authenticate,
  [
    body('equipmentId').isInt(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('purpose').notEmpty().trim()
  ],
  async (req: AuthRequest, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { equipmentId, startDate, endDate, purpose } = req.body;
    
    try {
      // Check if equipment exists and is available
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId }
      });
      
      if (!equipment || !equipment.available || equipment.quantity <= 0) {
        return res.status(400).json({ error: 'Equipment not available' });
      }
      
      // Check for overlapping requests
      const overlapping = await prisma.borrowRequest.findFirst({
        where: {
          equipmentId,
          status: { in: ['APPROVED', 'PENDING'] },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            }
          ]
        }
      });
      
      if (overlapping) {
        return res.status(400).json({ error: 'Equipment already booked for selected dates' });
      }
      
      const request = await prisma.borrowRequest.create({
        data: {
          userId: req.userId!,
          equipmentId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          purpose,
          status: 'PENDING'
        },
        include: { equipment: true }
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update request status (Admin/Staff only)
router.patch('/:id/status',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  [
    body('status').isIn(['APPROVED', 'REJECTED', 'RETURNED'])
  ],
  async (req: AuthRequest, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status } = req.body;
    const requestId = parseInt(req.params.id);
    
    try {
      const request = await prisma.borrowRequest.findUnique({
        where: { id: requestId },
        include: { equipment: true }
      });
      
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Update request status
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id: requestId },
        data: { status }
      });
      
      // If approved, decrease equipment quantity
      if (status === 'APPROVED') {
        await prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { quantity: { decrement: 1 } }
        });
      }
      
      // If returned, increase equipment quantity
      if (status === 'RETURNED') {
        await prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { quantity: { increment: 1 } }
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;