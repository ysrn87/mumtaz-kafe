import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Starting database reset...');

  try {
    // Use transaction to ensure all or nothing
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints (child tables first)
      
      console.log('  🗑️  Deleting cashflows...');
      await tx.cashflow.deleteMany({});
      
      console.log('  🗑️  Deleting point history...');
      await tx.pointHistory.deleteMany({});
      
      console.log('  🗑️  Deleting sale items...');
      await tx.saleItem.deleteMany({});
      
      console.log('  🗑️  Deleting sales...');
      await tx.sale.deleteMany({});
      
      console.log('  🗑️  Deleting stock movements...');
      await tx.stockMovement.deleteMany({});
      
      console.log('  🗑️  Deleting product variants...');
      await tx.productVariant.deleteMany({});
      
      console.log('  🗑️  Deleting products...');
      await tx.product.deleteMany({});
      
      // Keep users (credentials) - uncomment below if you want to delete non-admin users
      // console.log('  🗑️  Deleting non-admin users...');
      // await tx.user.deleteMany({ where: { role: { not: 'ADMINISTRATOR' } } });
      
      console.log('  🗑️  Resetting user points to 0...');
      await tx.user.updateMany({
        data: { points: 0 }
      });
    });

    console.log('✅ Database reset completed!');
    console.log('   - All business data deleted (products, sales, stock, etc.)');
    console.log('   - User credentials preserved');
    console.log('   - User points reset to 0');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });