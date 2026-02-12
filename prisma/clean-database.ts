import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting COMPLETE database clean...');
  console.log('⚠️  WARNING: This will DELETE EVERYTHING including all users and settings!\n');

  try {
    // Use transaction to ensure all or nothing
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints (child tables first)
      
      console.log('  🗑️  Deleting cashflows...');
      const cashflowCount = await tx.cashflow.deleteMany({});
      console.log(`     ✓ Deleted ${cashflowCount.count} cashflow records`);
      
      console.log('  🗑️  Deleting point history...');
      const pointHistoryCount = await tx.pointHistory.deleteMany({});
      console.log(`     ✓ Deleted ${pointHistoryCount.count} point history records`);
      
      console.log('  🗑️  Deleting sale items...');
      const saleItemCount = await tx.saleItem.deleteMany({});
      console.log(`     ✓ Deleted ${saleItemCount.count} sale items`);
      
      console.log('  🗑️  Deleting sales...');
      const salesCount = await tx.sale.deleteMany({});
      console.log(`     ✓ Deleted ${salesCount.count} sales`);
      
      console.log('  🗑️  Deleting stock movements...');
      const stockMovementCount = await tx.stockMovement.deleteMany({});
      console.log(`     ✓ Deleted ${stockMovementCount.count} stock movements`);
      
      console.log('  🗑️  Deleting product variants...');
      const variantCount = await tx.productVariant.deleteMany({});
      console.log(`     ✓ Deleted ${variantCount.count} product variants`);
      
      console.log('  🗑️  Deleting products...');
      const productCount = await tx.product.deleteMany({});
      console.log(`     ✓ Deleted ${productCount.count} products`);
      
      console.log('  🗑️  Deleting settings...');
      const settingsCount = await tx.settings.deleteMany({});
      console.log(`     ✓ Deleted ${settingsCount.count} settings`);
      
      console.log('  🗑️  Deleting ALL users...');
      const userCount = await tx.user.deleteMany({});
      console.log(`     ✓ Deleted ${userCount.count} users`);
    });

    console.log('\n✅ Database cleaned successfully!');
    console.log('   ✓ ALL data deleted (including users and settings)');
    console.log('   ✓ Database is now completely empty');
    console.log('\n💡 Tip: Run "npm run db:seed" to add fresh data');
    
  } catch (error) {
    console.error('\n❌ Clean failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
