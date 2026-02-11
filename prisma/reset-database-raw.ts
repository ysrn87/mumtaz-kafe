// reset-database-raw.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabaseRaw() {
  console.log('🧹 Starting database reset (raw SQL)...');

  try {
    // Disable foreign key checks temporarily (PostgreSQL)
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);
    
    // Truncate all tables except users (cascade clears related data)
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        cashflows,
        point_history,
        sale_items,
        sales,
        stock_movements,
        product_variants,
        products
      CASCADE;
    `);
    
    // Reset user points
    await prisma.$executeRawUnsafe(`
      UPDATE users SET points = 0;
    `);
    
    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);

    console.log('✅ Database reset completed!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabaseRaw()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });