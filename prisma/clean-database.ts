import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting COMPLETE database clean...');
  console.log('⚠️  WARNING: This will DELETE EVERYTHING including all users and settings!\n');

  try {
    // Use transaction with longer timeout to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints (child tables first)
      
      const cashflowCount = await tx.cashflow.deleteMany({});
      const pointHistoryCount = await tx.pointHistory.deleteMany({});
      const saleItemCount = await tx.saleItem.deleteMany({});
      const salesCount = await tx.sale.deleteMany({});
      const stockMovementCount = await tx.stockMovement.deleteMany({});
      const variantCount = await tx.productVariant.deleteMany({});
      const productCount = await tx.product.deleteMany({});
      const settingsCount = await tx.settings.deleteMany({});
      const userCount = await tx.user.deleteMany({});

      return {
        cashflowCount: cashflowCount.count,
        pointHistoryCount: pointHistoryCount.count,
        saleItemCount: saleItemCount.count,
        salesCount: salesCount.count,
        stockMovementCount: stockMovementCount.count,
        variantCount: variantCount.count,
        productCount: productCount.count,
        settingsCount: settingsCount.count,
        userCount: userCount.count,
      };
    }, {
      timeout: 10000, // 10 seconds timeout
    });

    // Show results after transaction completes
    console.log('  🗑️  Deleted records:');
    console.log(`     ✓ Cashflows: ${result.cashflowCount}`);
    console.log(`     ✓ Point history: ${result.pointHistoryCount}`);
    console.log(`     ✓ Sale items: ${result.saleItemCount}`);
    console.log(`     ✓ Sales: ${result.salesCount}`);
    console.log(`     ✓ Stock movements: ${result.stockMovementCount}`);
    console.log(`     ✓ Product variants: ${result.variantCount}`);
    console.log(`     ✓ Products: ${result.productCount}`);
    console.log(`     ✓ Settings: ${result.settingsCount}`);
    console.log(`     ✓ Users: ${result.userCount}`);

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