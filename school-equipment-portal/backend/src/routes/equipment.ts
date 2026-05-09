import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Get all equipment with filters
router.get('/', async (req, res) => {
  const { category, available, search } = req.query;
  
  try {
    const where: any = {};
    
    if (category) where.category = category as string;
    if (available === 'true') where.available = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }
    
    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        requests: {
          where: { status: { in: ['APPROVED', 'PENDING'] } },
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create equipment (Admin only)
router.post('/', 
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty(),
    body('condition').notEmpty(),
    body('quantity').isInt({ min: 1 }),
    body('description').optional()
  ],
  async (req: any, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, category, condition, quantity, description, imageUrl } = req.body;
    
    try {
      const equipment = await prisma.equipment.create({
        data: {
          name,
          category,
          condition,
          quantity,
          available: quantity > 0,
          description,
          imageUrl
        }
      });
      
      res.status(201).json(equipment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update equipment (Admin only)
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      const equipment = await prisma.equipment.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
      });
      
      res.json(equipment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete equipment (Admin only)
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      await prisma.equipment.delete({
        where: { id: parseInt(req.params.id) }
      });
      
      res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;