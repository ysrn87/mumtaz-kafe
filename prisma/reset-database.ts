import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Starting database reset...');
  console.log('📌 This will DELETE all business data but KEEP user credentials\n');

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
      
      const userUpdate = await tx.user.updateMany({
        data: { points: 0 }
      });

      return {
        cashflowCount: cashflowCount.count,
        pointHistoryCount: pointHistoryCount.count,
        saleItemCount: saleItemCount.count,
        salesCount: salesCount.count,
        stockMovementCount: stockMovementCount.count,
        variantCount: variantCount.count,
        productCount: productCount.count,
        settingsCount: settingsCount.count,
        userUpdate: userUpdate.count,
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
    console.log(`     ✓ Reset points for ${result.userUpdate} users`);

    console.log('\n✅ Database reset completed successfully!');
    console.log('   ✓ All business data deleted');
    console.log('   ✓ All settings deleted');
    console.log('   ✓ All user credentials preserved (email, phone, password, name, role, address, birthday)');
    console.log('   ✓ User points reset to 0');
    console.log('\n💡 Tip: Run "npm run db:seed" to add sample data');
    
  } catch (error) {
    console.error('\n❌ Reset failed:', error);
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