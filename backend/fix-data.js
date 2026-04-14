const { admin, db } = require('./config/firebase');

async function fixData() {
  console.log('🔄 Adjusting database...');

  try {
    // 1. Delete "sports culture"
    console.log('Finding "sports culture" to delete...');
    const oppsRef = db.collection('opportunities');
    const snapshot = await oppsRef.where('title', '==', 'sports culture').get();
    
    let deletedCount = 0;
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} 'sports culture' opportunities.`);

    // 2. Add some non-academic jobs
    console.log('Adding non-academic jobs...');
    
    // We will find our seeded arts organization to post the jobs, or create one if missing
    let orgId = `seed_org_jobs_${Date.now()}`;
    const orgData = {
        uid: orgId,
        email: 'talent_agency@seed.com',
        displayName: 'Premier Talent Agency',
        role: 'organization',
        bio: 'We scout for the best non-academic talent across the country.',
        location: 'Los Angeles, CA',
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(orgId).set(orgData);

    const jobs = [
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Lead Choreographer - Music Video',
        description: 'Seeking an experienced choreographer for an upcoming high-budget music video. Must have experience with hip-hop and contemporary.',
        category: 'job',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Los Angeles, CA (On-Site)',
        eligibility: '3+ years of professional choreography experience',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Assistant Football Coach',
        description: 'Local academy is seeking a passionate assistant coach to help train our U-16 division.',
        category: 'job',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Miami, FL',
        eligibility: 'Must have previous coaching or college-level playing experience.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Session Musician (Guitarist)',
        description: 'Looking for a versatile session guitarist for studio recordings. Should be comfortable with jazz and funk.',
        category: 'job',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Nashville, TN',
        eligibility: 'Portfolio/reel required.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const job of jobs) {
      await db.collection('opportunities').add(job);
    }
    
    console.log(`✅ Added ${jobs.length} non-academic jobs.`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixData();
