import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMINISTRATOR,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      role: Role.MANAGER,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password: hashedPassword,
      name: 'Member User',
      role: Role.MEMBER,
      points: 100,
    },
  });

  console.log('✅ Created users:', { admin, manager, member });

  // Create products
  const tshirt = await prisma.product.create({
    data: {
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      sku: 'TSH-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: 'Small - Black',
            sku: 'TSH-001-S-BLK',
            price: 19.99,
            cost: 10.00,
            stock: 50,
          },
          {
            name: 'Medium - Black',
            sku: 'TSH-001-M-BLK',
            price: 19.99,
            cost: 10.00,
            stock: 75,
          },
          {
            name: 'Large - Black',
            sku: 'TSH-001-L-BLK',
            price: 19.99,
            cost: 10.00,
            stock: 60,
          },
        ],
      },
    },
  });

  const jeans = await prisma.product.create({
    data: {
      name: 'Jeans',
      description: 'Classic denim jeans',
      sku: 'JNS-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: '30x30 - Blue',
            sku: 'JNS-001-30-BLU',
            price: 49.99,
            cost: 25.00,
            stock: 30,
          },
          {
            name: '32x32 - Blue',
            sku: 'JNS-001-32-BLU',
            price: 49.99,
            cost: 25.00,
            stock: 40,
          },
        ],
      },
    },
  });

  console.log('✅ Created products with variants');

  // Create a sample sale
  const variant = await prisma.productVariant.findFirst();
  
  if (variant) {
    const sale = await prisma.sale.create({
      data: {
        saleNumber: 'SALE-00001',
        cashierId: manager.id,
        customerId: member.id,
        subtotal: 19.99,
        discount: 0,
        tax: 1.60,
        total: 21.59,
        paymentMethod: 'CASH',
        pointsEarned: 21,
        items: {
          create: {
            variantId: variant.id,
            quantity: 1,
            price: 19.99,
            subtotal: 19.99,
          },
        },
      },
    });

    // Update stock
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stock: { decrement: 1 } },
    });

    // Add stock movement
    await prisma.stockMovement.create({
      data: {
        variantId: variant.id,
        quantity: -1,
        type: 'OUT',
        notes: `Sale ${sale.saleNumber}`,
      },
    });

    // Add points history
    await prisma.pointHistory.create({
      data: {
        userId: member.id,
        points: 21,
        type: 'EARNED',
        description: `Earned from sale ${sale.saleNumber}`,
      },
    });

    // Update member points
    await prisma.user.update({
      where: { id: member.id },
      data: { points: { increment: 21 } },
    });

    console.log('✅ Created sample sale');
  }

  // Create cashflow records
  await prisma.cashflow.createMany({
    data: [
      {
        type: 'INCOME',
        category: 'Sales',
        amount: 21.59,
        description: 'Daily sales revenue',
        createdById: admin.id,
      },
      {
        type: 'EXPENSE',
        category: 'Inventory',
        amount: 500.00,
        description: 'Stock purchase',
        createdById: admin.id,
      },
      {
        type: 'EXPENSE',
        category: 'Utilities',
        amount: 150.00,
        description: 'Monthly electricity bill',
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Created cashflow records');
  console.log('\n🎉 Seeding completed!\n');
  console.log('Login credentials:');
  console.log('Admin: admin@example.com / password123');
  console.log('Manager: manager@example.com / password123');
  console.log('Member: member@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
