import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@school.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN'  // String value
      }
    });
    console.log('Admin user created: admin@school.com / admin123');
  }
  
  // Create a staff user
  const staffEmail = 'staff@school.com';
  const existingStaff = await prisma.user.findUnique({
    where: { email: staffEmail }
  });
  
  if (!existingStaff) {
    const hashedPassword = await bcrypt.hash('staff123', 10);
    await prisma.user.create({
      data: {
        email: staffEmail,
        password: hashedPassword,
        name: 'Staff Member',
        role: 'STAFF'  // String value
      }
    });
    console.log('Staff user created: staff@school.com / staff123');
  }
  
  // Create sample equipment
  const equipmentCount = await prisma.equipment.count();
  if (equipmentCount === 0) {
    await prisma.equipment.createMany({
      data: [
        {
          name: 'DSLR Camera',
          category: 'Electronics',
          condition: 'Good',
          quantity: 3,
          description: 'Canon EOS 200D with kit lens'
        },
        {
          name: 'Basketball',
          category: 'Sports',
          condition: 'New',
          quantity: 10,
          description: 'Official size basketball'
        },
        {
          name: 'Microscope',
          category: 'Lab Equipment',
          condition: 'Good',
          quantity: 5,
          description: 'Dual-view microscope for biology labs'
        },
        {
          name: 'Acoustic Guitar',
          category: 'Musical Instruments',
          condition: 'Fair',
          quantity: 2,
          description: 'Steel-string acoustic guitar'
        },
        {
          name: 'Arduino Kit',
          category: 'Electronics',
          condition: 'Good',
          quantity: 8,
          description: 'Complete Arduino starter kit'
        },
        {
          name: 'Laptop',
          category: 'Electronics',
          condition: 'Good',
          quantity: 4,
          description: 'Development laptop with required software'
        },
        {
          name: 'Science Kit',
          category: 'Lab Equipment',
          condition: 'New',
          quantity: 6,
          description: 'Complete science experiment kit'
        }
      ]
    });
    console.log('Sample equipment created');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });