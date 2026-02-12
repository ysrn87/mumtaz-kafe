import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Starting database reset...');
  console.log('📌 This will DELETE all business data but KEEP user credentials\n');

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
      
      console.log('  🔄 Resetting user points to 0...');
      const userUpdate = await tx.user.updateMany({
        data: { points: 0 }
      });
      console.log(`     ✓ Reset points for ${userUpdate.count} users`);
    });

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
