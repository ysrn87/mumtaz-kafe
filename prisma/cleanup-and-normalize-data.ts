import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper functions
const normalizePhone = (phone: string): string => {
  return phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
};

const normalizeEmail = (email: string | null): string | null => {
  if (!email || email.trim() === '') return null;
  return email.trim().toLowerCase();
};

async function cleanAllData() {
  console.log('🚀 Starting data cleanup and normalization...\n');
  
  // STEP 1: Clean phone numbers
  console.log('📞 STEP 1: Cleaning phone numbers...');
  await cleanPhoneNumbers();
  
  // STEP 2: Normalize emails
  console.log('\n📧 STEP 2: Normalizing emails...');
  await normalizeEmails();
  
  // STEP 3: Check for duplicates
  console.log('\n🔍 STEP 3: Checking for duplicates...');
  await checkDuplicates();
  
  console.log('\n✨ Cleanup completed!');
}

async function cleanPhoneNumbers() {
  const users = await prisma.user.findMany({
    where: {
      phone: {
        contains: ' '
      }
    }
  });

  if (users.length === 0) {
    console.log('   ✅ No phone numbers need cleaning!');
    return;
  }

  console.log(`   Found ${users.length} phone numbers with spaces\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const user of users) {
    const originalPhone = user.phone;
    const cleanPhone = normalizePhone(user.phone);
    
    // Check if cleaned phone would create a duplicate
    const duplicate = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        id: { not: user.id }
      }
    });

    if (duplicate) {
      console.log(`   ⚠️  SKIP: ${originalPhone} → ${cleanPhone} (${user.name})`);
      console.log(`      Reason: Would duplicate with: ${duplicate.name} (${duplicate.phone})`);
      failed++;
      continue;
    }
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: cleanPhone }
      });
      console.log(`   ✅ ${originalPhone} → ${cleanPhone} (${user.name})`);
      updated++;
    } catch (error) {
      console.error(`   ❌ Failed: ${user.name}`, error);
      failed++;
    }
  }

  console.log(`\n   Summary: ${updated} cleaned, ${failed} failed/skipped`);
}

async function normalizeEmails() {
  const users = await prisma.user.findMany({
    where: {
      email: { not: null }
    }
  });

  if (users.length === 0) {
    console.log('   ✅ No emails to normalize!');
    return;
  }

  console.log(`   Found ${users.length} users with emails\n`);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const user of users) {
    const originalEmail = user.email;
    const normalizedEmail = normalizeEmail(user.email);
    
    // Skip if already normalized
    if (originalEmail === normalizedEmail) {
      skipped++;
      continue;
    }
    
    // Check if normalized email would create a duplicate
    if (normalizedEmail) {
      const duplicate = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: user.id }
        }
      });

      if (duplicate) {
        console.log(`   ⚠️  SKIP: ${originalEmail} → ${normalizedEmail} (${user.name})`);
        console.log(`      Reason: Would duplicate with: ${duplicate.name} (${duplicate.email})`);
        failed++;
        continue;
      }
    }
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: normalizedEmail }
      });
      console.log(`   ✅ ${originalEmail} → ${normalizedEmail} (${user.name})`);
      updated++;
    } catch (error) {
      console.error(`   ❌ Failed: ${user.name}`, error);
      failed++;
    }
  }

  console.log(`\n   Summary: ${updated} normalized, ${skipped} already OK, ${failed} failed/skipped`);
}

async function checkDuplicates() {
  // Check duplicate phones
  const duplicatePhones = await prisma.$queryRaw<Array<{phone: string, count: bigint}>>`
    SELECT phone, COUNT(*) as count 
    FROM users 
    GROUP BY phone 
    HAVING COUNT(*) > 1
  `;

  if (duplicatePhones.length > 0) {
    console.log(`\n   ❌ Found ${duplicatePhones.length} duplicate phone numbers:`);
    for (const dup of duplicatePhones) {
      console.log(`      Phone: ${dup.phone} (${dup.count} users)`);
      
      // Show which users have this phone
      const users = await prisma.user.findMany({
        where: { phone: dup.phone },
        select: { id: true, name: true, email: true, createdAt: true }
      });
      
      users.forEach(user => {
        console.log(`         - ${user.name} (${user.email || 'no email'}) - Created: ${user.createdAt}`);
      });
    }
    console.log('\n   ⚠️  You must manually resolve these duplicates before adding unique constraint!');
  } else {
    console.log('   ✅ No duplicate phone numbers found!');
  }

  // Check duplicate emails
  const duplicateEmails = await prisma.$queryRaw<Array<{email: string, count: bigint}>>`
    SELECT email, COUNT(*) as count 
    FROM users 
    WHERE email IS NOT NULL
    GROUP BY email 
    HAVING COUNT(*) > 1
  `;

  if (duplicateEmails.length > 0) {
    console.log(`\n   ❌ Found ${duplicateEmails.length} duplicate emails:`);
    for (const dup of duplicateEmails) {
      console.log(`      Email: ${dup.email} (${dup.count} users)`);
      
      // Show which users have this email
      const users = await prisma.user.findMany({
        where: { email: dup.email },
        select: { id: true, name: true, phone: true, createdAt: true }
      });
      
      users.forEach(user => {
        console.log(`         - ${user.name} (${user.phone}) - Created: ${user.createdAt}`);
      });
    }
    console.log('\n   ⚠️  Email should already have unique constraint, but found duplicates!');
  } else {
    console.log('   ✅ No duplicate emails found!');
  }
}

// Run the cleanup
cleanAllData()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ All cleanup tasks completed!');
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
