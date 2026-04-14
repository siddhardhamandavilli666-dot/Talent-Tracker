const { admin, db } = require('./config/firebase');

async function addMoreData() {
  console.log('➕ Adding more varied non-academic data...');

  try {
    const orgId = `seed_org_varied_${Date.now()}`;
    const orgData = {
        uid: orgId,
        email: 'global_talent_scouts@seed.com',
        displayName: 'Global Talent Scouts',
        role: 'organization',
        bio: 'Connecting raw, unacademic talent with global stages, leagues, and agencies.',
        location: 'London, UK',
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(orgId).set(orgData);

    const diverseOpportunities = [
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Lead Actor - Independent Sci-Fi Short',
        description: 'Casting the lead male role (playing age 18-30) for an upcoming indie sci-fi short film. Strong emotional range required.',
        category: 'job',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Austin, TX',
        eligibility: 'Must submit a 2-minute dramatic monologue reel.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'National Culinary Showdown',
        description: 'Amateur chefs, show us your best signature dish! The winner receives a 1-year apprenticeship at a Michelin-star restaurant.',
        category: 'competition',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Seattle, WA',
        eligibility: 'No formal culinary degrees permitted. Home cooks only.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Esports Roster Tryouts - Valorant',
        description: 'Our Tier-2 organization is looking for a dedicated Sentinel player to complete our main roster for the upcoming season.',
        category: 'internship', // acting as a trial
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Remote (NA Server)',
        eligibility: 'Rank Immortal 3 or Radiant peak only.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Sports Modeling Campaign',
        description: 'Seeking diverse fitness and sports models for a major summer sportswear brand campaign. Need expressive, high-energy individuals.',
        category: 'job',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Los Angeles, CA',
        eligibility: 'Open casting. Please provide portfolio images.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Youth Community Center - Music Tutor',
        description: 'Looking for a guitarist or pianist to spend weekends teaching music basics to underprivileged youth.',
        category: 'volunteering',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Detroit, MI',
        eligibility: 'Basic musical proficiency and patience.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        orgId: orgId,
        orgName: orgData.displayName,
        title: 'Stand-up Comedy Open Mic Contest',
        description: '5 minutes to make the crowd roar! Cash prizes for the top 3 comedians of the night, plus a guaranteed weekend slot.',
        category: 'competition',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Chicago, IL',
        eligibility: 'Must prepare entirely original material.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const item of diverseOpportunities) {
      await db.collection('opportunities').add(item);
    }
    
    console.log(`✅ Successfully added ${diverseOpportunities.length} diverse, non-academic opportunities!`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addMoreData();
