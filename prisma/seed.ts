import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('👥 Creating users...');
  const admin = await prisma.user.upsert({
    where: { phone: '+62812345678' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+62812345678',
      address: 'Jl. Admin No. 123, Jakarta',
      role: Role.ADMINISTRATOR,
      birthday: new Date('1990-01-15'),
    },
  });

  const manager = await prisma.user.upsert({
    where: { phone: '+62898765432' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      phone: '+62898765432',
      address: 'Jl. Manager No. 456, Jakarta',
      role: Role.MANAGER,
      birthday: new Date('1992-05-20'),
    },
  });

  const member1 = await prisma.user.upsert({
    where: { phone: '+62811223344' },
    update: {},
    create: {
      email: 'member@example.com',
      password: hashedPassword,
      name: 'Member User',
      phone: '+62811223344',
      address: 'Jl. Member No. 789, Jakarta',
      role: Role.MEMBER,
      points: 0,
      birthday: new Date('1995-08-10'),
    },
  });

  const member2 = await prisma.user.upsert({
    where: { phone: '+62855667788' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '+62855667788',
      address: 'Jl. John No. 101, Jakarta',
      role: Role.MEMBER,
      points: 0,
      birthday: new Date('1988-03-25'),
    },
  });

  // Create member without email (phone only)
  const member3 = await prisma.user.upsert({
    where: { phone: '+62877889900' },
    update: {},
    create: {
      password: hashedPassword,
      name: 'Phone User',
      phone: '+62877889900',
      address: 'Jl. Phone No. 202, Bekasi',
      role: Role.MEMBER,
      points: 0,
      birthday: new Date('1998-12-05'),
    },
  });

  console.log('   ✓ Created 5 users (1 admin, 1 manager, 3 members)');

  // Initialize Settings
  console.log('\n⚙️  Initializing settings...');
  await prisma.settings.upsert({
    where: { key: 'pointsConversionRate' },
    update: {},
    create: {
      key: 'pointsConversionRate',
      value: '1000',
      description: 'Points to Rupiah conversion rate (1 point = X Rupiah)',
    },
  });

  await prisma.settings.upsert({
    where: { key: 'minPointsForRedemption' },
    update: {},
    create: {
      key: 'minPointsForRedemption',
      value: '10',
      description: 'Minimum points required to redeem',
    },
  });

  await prisma.settings.upsert({
    where: { key: 'maxPointsPerTransaction' },
    update: {},
    create: {
      key: 'maxPointsPerTransaction',
      value: '1000',
      description: 'Maximum points that can be redeemed in a single transaction',
    },
  });

  console.log('   ✓ Created 3 settings');

  // Create products with variants
  console.log('\n📦 Creating products...');
  
  const tshirt = await prisma.product.create({
    data: {
      name: 'T-Shirt Cotton',
      description: 'Premium 100% cotton t-shirt, comfortable and breathable',
      sku: 'TSH-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: 'Small - Black',
            sku: 'TSH-001-S-BLK',
            price: 150000,
            cost: 75000,
            stock: 50,
            lowStock: 10,
            points: 15,
          },
          {
            name: 'Medium - Black',
            sku: 'TSH-001-M-BLK',
            price: 150000,
            cost: 75000,
            stock: 75,
            lowStock: 10,
            points: 15,
          },
          {
            name: 'Large - Black',
            sku: 'TSH-001-L-BLK',
            price: 150000,
            cost: 75000,
            stock: 60,
            lowStock: 10,
            points: 15,
          },
          {
            name: 'Small - White',
            sku: 'TSH-001-S-WHT',
            price: 150000,
            cost: 75000,
            stock: 45,
            lowStock: 10,
            points: 15,
          },
          {
            name: 'Medium - White',
            sku: 'TSH-001-M-WHT',
            price: 150000,
            cost: 75000,
            stock: 80,
            lowStock: 10,
            points: 15,
          },
        ],
      },
    },
  });

  const jeans = await prisma.product.create({
    data: {
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans with comfortable fit',
      sku: 'JNS-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: '28 - Dark Blue',
            sku: 'JNS-001-28-DBLUE',
            price: 350000,
            cost: 180000,
            stock: 30,
            lowStock: 5,
            points: 35,
          },
          {
            name: '30 - Dark Blue',
            sku: 'JNS-001-30-DBLUE',
            price: 350000,
            cost: 180000,
            stock: 40,
            lowStock: 5,
            points: 35,
          },
          {
            name: '32 - Dark Blue',
            sku: 'JNS-001-32-DBLUE',
            price: 350000,
            cost: 180000,
            stock: 35,
            lowStock: 5,
            points: 35,
          },
          {
            name: '30 - Light Blue',
            sku: 'JNS-001-30-LBLUE',
            price: 350000,
            cost: 180000,
            stock: 25,
            lowStock: 5,
            points: 35,
          },
        ],
      },
    },
  });

  const sneakers = await prisma.product.create({
    data: {
      name: 'Sport Sneakers',
      description: 'Comfortable sports sneakers for daily activities',
      sku: 'SNK-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: 'Size 40 - White',
            sku: 'SNK-001-40-WHT',
            price: 500000,
            cost: 280000,
            stock: 20,
            lowStock: 5,
            points: 50,
          },
          {
            name: 'Size 41 - White',
            sku: 'SNK-001-41-WHT',
            price: 500000,
            cost: 280000,
            stock: 25,
            lowStock: 5,
            points: 50,
          },
          {
            name: 'Size 42 - White',
            sku: 'SNK-001-42-WHT',
            price: 500000,
            cost: 280000,
            stock: 30,
            lowStock: 5,
            points: 50,
          },
          {
            name: 'Size 40 - Black',
            sku: 'SNK-001-40-BLK',
            price: 500000,
            cost: 280000,
            stock: 18,
            lowStock: 5,
            points: 50,
          },
          {
            name: 'Size 41 - Black',
            sku: 'SNK-001-41-BLK',
            price: 500000,
            cost: 280000,
            stock: 22,
            lowStock: 5,
            points: 50,
          },
        ],
      },
    },
  });

  const hoodie = await prisma.product.create({
    data: {
      name: 'Hoodie Premium',
      description: 'Warm and comfortable premium hoodie',
      sku: 'HDI-001',
      createdById: admin.id,
      variants: {
        create: [
          {
            name: 'M - Grey',
            sku: 'HDI-001-M-GRY',
            price: 280000,
            cost: 150000,
            stock: 40,
            lowStock: 8,
            points: 28,
          },
          {
            name: 'L - Grey',
            sku: 'HDI-001-L-GRY',
            price: 280000,
            cost: 150000,
            stock: 35,
            lowStock: 8,
            points: 28,
          },
          {
            name: 'XL - Grey',
            sku: 'HDI-001-XL-GRY',
            price: 280000,
            cost: 150000,
            stock: 30,
            lowStock: 8,
            points: 28,
          },
          {
            name: 'M - Navy',
            sku: 'HDI-001-M-NVY',
            price: 280000,
            cost: 150000,
            stock: 45,
            lowStock: 8,
            points: 28,
          },
        ],
      },
    },
  });

  const cap = await prisma.product.create({
    data: {
      name: 'Baseball Cap',
      description: 'Classic baseball cap with adjustable strap',
      sku: 'CAP-001',
      createdById: manager.id,
      variants: {
        create: [
          {
            name: 'One Size - Black',
            sku: 'CAP-001-OS-BLK',
            price: 120000,
            cost: 60000,
            stock: 100,
            lowStock: 15,
            points: 12,
          },
          {
            name: 'One Size - White',
            sku: 'CAP-001-OS-WHT',
            price: 120000,
            cost: 60000,
            stock: 85,
            lowStock: 15,
            points: 12,
          },
          {
            name: 'One Size - Red',
            sku: 'CAP-001-OS-RED',
            price: 120000,
            cost: 60000,
            stock: 60,
            lowStock: 15,
            points: 12,
          },
        ],
      },
    },
  });

  console.log('   ✓ Created 5 products with 24 variants');

  // Create sample sales
  console.log('\n💰 Creating sample sales...');
  
  const variants = await prisma.productVariant.findMany({
    take: 8,
    orderBy: { createdAt: 'asc' },
  });

  // Sale 1: Member1 buys t-shirt
  if (variants.length > 0) {
    const sale1 = await prisma.sale.create({
      data: {
        saleNumber: 'SALE-00001',
        cashierId: manager.id,
        customerId: member1.id,
        subtotal: 150000,
        discount: 0,
        tax: 15000,
        total: 165000,
        paymentMethod: 'CASH',
        pointsEarned: 15,
        items: {
          create: {
            variantId: variants[0].id,
            quantity: 1,
            price: 150000,
            subtotal: 150000,
          },
        },
      },
    });

    // Update stock and add movements
    await prisma.productVariant.update({
      where: { id: variants[0].id },
      data: { stock: { decrement: 1 } },
    });

    await prisma.stockMovement.create({
      data: {
        variantId: variants[0].id,
        quantity: -1,
        type: 'OUT',
        notes: `Sale ${sale1.saleNumber}`,
      },
    });

    // Add points
    await prisma.pointHistory.create({
      data: {
        userId: member1.id,
        points: 15,
        type: 'EARNED',
        description: `Earned from sale ${sale1.saleNumber}`,
        expiresAt: new Date(new Date().getFullYear(), 11, 31), // Dec 31 this year
      },
    });

    await prisma.user.update({
      where: { id: member1.id },
      data: { points: { increment: 15 } },
    });

    console.log('   ✓ Created sale 1 (Member purchase - T-Shirt)');
  }

  // Sale 2: Member2 buys jeans and hoodie
  if (variants.length > 6) {
    const sale2 = await prisma.sale.create({
      data: {
        saleNumber: 'SALE-00002',
        cashierId: manager.id,
        customerId: member2.id,
        subtotal: 630000,
        discount: 30000,
        tax: 60000,
        total: 660000,
        paymentMethod: 'CARD',
        pointsEarned: 63,
        notes: 'Special discount applied',
        items: {
          create: [
            {
              variantId: variants[5].id,
              quantity: 1,
              price: 350000,
              subtotal: 350000,
            },
            {
              variantId: variants[9].id,
              quantity: 1,
              price: 280000,
              subtotal: 280000,
            },
          ],
        },
      },
    });

    // Update stocks
    await prisma.productVariant.update({
      where: { id: variants[5].id },
      data: { stock: { decrement: 1 } },
    });

    await prisma.stockMovement.create({
      data: {
        variantId: variants[5].id,
        quantity: -1,
        type: 'OUT',
        notes: `Sale ${sale2.saleNumber}`,
      },
    });

    await prisma.productVariant.update({
      where: { id: variants[9].id },
      data: { stock: { decrement: 1 } },
    });

    await prisma.stockMovement.create({
      data: {
        variantId: variants[9].id,
        quantity: -1,
        type: 'OUT',
        notes: `Sale ${sale2.saleNumber}`,
      },
    });

    // Add points
    await prisma.pointHistory.create({
      data: {
        userId: member2.id,
        points: 63,
        type: 'EARNED',
        description: `Earned from sale ${sale2.saleNumber}`,
        expiresAt: new Date(new Date().getFullYear(), 11, 31),
      },
    });

    await prisma.user.update({
      where: { id: member2.id },
      data: { points: { increment: 63 } },
    });

    console.log('   ✓ Created sale 2 (Multiple items - Jeans + Hoodie)');
  }

  // Sale 3: Member3 (phone-only user) buys sneakers with points redemption
  if (variants.length > 11) {
    // First give member3 some points
    await prisma.user.update({
      where: { id: member3.id },
      data: { points: 100 },
    });

    await prisma.pointHistory.create({
      data: {
        userId: member3.id,
        points: 100,
        type: 'ADJUSTED',
        description: 'Initial bonus points',
        expiresAt: new Date(new Date().getFullYear(), 11, 31),
      },
    });

    const sale3 = await prisma.sale.create({
      data: {
        saleNumber: 'SALE-00003',
        cashierId: admin.id,
        customerId: member3.id,
        subtotal: 500000,
        discount: 50000, // 50 points redeemed
        tax: 45000,
        total: 495000,
        paymentMethod: 'TRANSFER',
        pointsEarned: 50,
        pointsRedeemed: 50,
        notes: 'Used 50 points for discount',
        items: {
          create: {
            variantId: variants[10].id,
            quantity: 1,
            price: 500000,
            subtotal: 500000,
          },
        },
      },
    });

    await prisma.productVariant.update({
      where: { id: variants[10].id },
      data: { stock: { decrement: 1 } },
    });

    await prisma.stockMovement.create({
      data: {
        variantId: variants[10].id,
        quantity: -1,
        type: 'OUT',
        notes: `Sale ${sale3.saleNumber}`,
      },
    });

    // Deduct redeemed points
    await prisma.pointHistory.create({
      data: {
        userId: member3.id,
        points: -50,
        type: 'REDEEMED',
        description: `Redeemed in sale ${sale3.saleNumber}`,
      },
    });

    // Add earned points
    await prisma.pointHistory.create({
      data: {
        userId: member3.id,
        points: 50,
        type: 'EARNED',
        description: `Earned from sale ${sale3.saleNumber}`,
        expiresAt: new Date(new Date().getFullYear(), 11, 31),
      },
    });

    // Net effect: +100 - 50 + 50 = 100
    await prisma.user.update({
      where: { id: member3.id },
      data: { points: 100 },
    });

    console.log('   ✓ Created sale 3 (Phone user - Sneakers with points redemption)');
  }

  // Create cashflow records
  console.log('\n💵 Creating cashflow records...');
  await prisma.cashflow.createMany({
    data: [
      {
        type: 'INCOME',
        category: 'Sales',
        amount: 1320000,
        description: 'Daily sales revenue from 3 transactions',
        createdById: admin.id,
        date: new Date(),
      },
      {
        type: 'EXPENSE',
        category: 'Inventory',
        amount: 5000000,
        description: 'Monthly stock purchase',
        createdById: admin.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        type: 'EXPENSE',
        category: 'Utilities',
        amount: 500000,
        description: 'Electricity bill',
        createdById: admin.id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        type: 'EXPENSE',
        category: 'Salary',
        amount: 8000000,
        description: 'Monthly staff salaries',
        createdById: admin.id,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        type: 'INCOME',
        category: 'Sales',
        amount: 1200000,
        description: 'Previous day sales',
        createdById: admin.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        type: 'EXPENSE',
        category: 'Rent',
        amount: 3000000,
        description: 'Monthly store rent',
        createdById: admin.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        type: 'EXPENSE',
        category: 'Marketing',
        amount: 750000,
        description: 'Social media advertising',
        createdById: manager.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ],
  });

  console.log('   ✓ Created 7 cashflow records');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   • 5 users created (1 admin, 1 manager, 3 members)');
  console.log('   • 3 system settings initialized');
  console.log('   • 5 products with 24 variants');
  console.log('   • 3 sample sales with points tracking');
  console.log('   • 7 cashflow records');
  console.log('   • Point history and stock movements tracked');
  console.log('\n🔐 Login credentials:');
  console.log('   Admin:       admin@example.com / password123');
  console.log('   Manager:     manager@example.com / password123');
  console.log('   Member:      member@example.com / password123');
  console.log('   Member:      john@example.com / password123');
  console.log('   Phone-only:  +62877889900 / password123');
  console.log('\n💡 Points System:');
  console.log('   • Member User has 15 points');
  console.log('   • John Doe has 63 points');
  console.log('   • Phone User has 100 points (after redemption)');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
