const { admin, db } = require('./config/firebase');

async function cleanSeededData() {
  console.log('🧹 Cleaning up all seeded data...');
  try {
    // 1. Find all seeded users
    const usersSnap = await db.collection('users')
      .where('email', '>=', '')
      .get();
      
    const seededUsers = usersSnap.docs.filter(doc => doc.data().email?.includes('@seed.com'));
    const seededUserIds = seededUsers.map(doc => doc.id);

    console.log(`Found ${seededUserIds.length} seeded users to delete.`);

    // 2. Delete related records
    let deletedOpps = 0;
    let deletedApps = 0;
    let deletedAchs = 0;

    // We can't do an 'in' query with more than 30 items, so we check locally if there are many.
    // For safety, just loop through all opportunities and check if orgId is in seededUserIds
    const oppsSnap = await db.collection('opportunities').get();
    for (const doc of oppsSnap.docs) {
      const data = doc.data();
      if (seededUserIds.includes(data.orgId) || data.title.toLowerCase().includes('intern') || data.title.toLowerCase().includes('hackathon') || data.title.toLowerCase().includes('developer') || data.title.toLowerCase().includes('designer')) {
        await doc.ref.delete();
        deletedOpps++;
      }
    }

    const appsSnap = await db.collection('applications').get();
    for (const doc of appsSnap.docs) {
      const data = doc.data();
      if (seededUserIds.includes(data.studentId) || seededUserIds.includes(data.orgId)) {
        await doc.ref.delete();
        deletedApps++;
      }
    }

    const achsSnap = await db.collection('achievements').get();
    for (const doc of achsSnap.docs) {
      const data = doc.data();
      if (seededUserIds.includes(data.userId)) {
        await doc.ref.delete();
        deletedAchs++;
      }
    }

    // 3. Delete the users themselves
    let deletedUsersCount = 0;
    for (const doc of seededUsers) {
      await doc.ref.delete();
      deletedUsersCount++;
    }

    console.log(`✅ Deleted ${deletedUsersCount} users`);
    console.log(`✅ Deleted ${deletedOpps} opportunities`);
    console.log(`✅ Deleted ${deletedApps} applications`);
    console.log(`✅ Deleted ${deletedAchs} achievements`);
    console.log('🧹 Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
}

cleanSeededData();
