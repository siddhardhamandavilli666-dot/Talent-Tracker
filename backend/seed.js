const { admin, db } = require('./config/firebase');

async function seedDatabase() {
  console.log('🌱 Starting non-academic database seeding...');

  try {
    // 1. Create Users (Talents and Evaluators/Organizations)
    console.log('Creating users...');
    
    const org1Id = `seed_org_sports_${Date.now()}`;
    const org2Id = `seed_org_arts_${Date.now()}`;
    const student1Id = `seed_talent_dance_${Date.now()}`;
    const student2Id = `seed_talent_sports_${Date.now()}`;

    const users = [
      {
        uid: org1Id,
        email: 'sports_org@seed.com',
        displayName: 'National Athletic Association',
        role: 'organization',
        bio: 'Fostering the next generation of athletic talent through competitions and trials.',
        location: 'Chicago, IL',
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: org2Id,
        email: 'arts_org@seed.com',
        displayName: 'Global Arts & Culture Foundation',
        role: 'organization',
        bio: 'Celebrating global artists, musicians, and performers.',
        location: 'New York, NY',
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: student1Id,
        email: 'dancer@seed.com',
        displayName: 'Elena Performer',
        role: 'student',
        bio: 'Professional contemporary and jazz dancer looking for big stages.',
        college: 'N/A',
        location: 'Los Angeles, CA',
        skills: ['Contemporary Dance', 'Ballet', 'Choreography'],
        achievementsCount: 0,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: student2Id,
        email: 'athlete@seed.com',
        displayName: 'Marcus Sprinter',
        role: 'student',
        bio: 'Track and field athlete specializing in the 100m sprint.',
        college: 'N/A',
        location: 'Houston, TX',
        skills: ['Sprint', 'Agility', 'Endurance'],
        achievementsCount: 0,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
    }
    console.log(`✅ Created ${users.length} non-academic users.`);

    // 2. Create Opportunities
    console.log('Creating opportunities...');
    
    const opp1Ref = db.collection('opportunities').doc();
    const opp2Ref = db.collection('opportunities').doc();
    const opp3Ref = db.collection('opportunities').doc();

    const opportunities = [
      {
        id: opp1Ref.id,
        orgId: org1Id,
        orgName: users[0].displayName,
        title: 'Open Athletics Trials 2026',
        description: 'Calling all track and field athletes for the upcoming national trials. Show your speed and agility.',
        category: 'competition',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Chicago, IL',
        eligibility: 'Age 16-25, no professional contracts.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        id: opp2Ref.id,
        orgId: org2Id,
        orgName: users[1].displayName,
        title: 'International Dance Showcase',
        description: 'Submit your best choreography video to win a spot on the main stage at the Global Arts Festival.',
        category: 'competition',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'New York, NY',
        eligibility: 'Open to dancers globally.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        id: opp3Ref.id,
        orgId: org2Id,
        orgName: users[1].displayName,
        title: 'Street Art & Mural Volunteering',
        description: 'Help us paint a massive 50ft mural downtown to celebrate local urban culture!',
        category: 'volunteering',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Denver, CO',
        eligibility: 'Must have experience with spray paint or large scale art.',
        status: 'active',
        applicationsCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const opp of opportunities) {
      const oppData = { ...opp };
      delete oppData.id;
      if (opp.id === opp1Ref.id) await opp1Ref.set(oppData);
      else if (opp.id === opp2Ref.id) await opp2Ref.set(oppData);
      else if (opp.id === opp3Ref.id) await opp3Ref.set(oppData);
    }
    console.log(`✅ Created ${opportunities.length} non-academic opportunities.`);

    // 3. Create Applications
    console.log('Creating applications...');
    
    const applications = [
      {
        studentId: student2Id,
        studentName: users[3].displayName,
        studentEmail: users[3].email,
        studentPhotoURL: '',
        opportunityId: opp1Ref.id,
        opportunityTitle: opportunities[0].title,
        orgId: org1Id,
        resumeURL: '',
        message: 'My current personal best for the 100m is 10.4s. I am ready for the trials.',
        status: 'shortlisted',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        studentId: student1Id,
        studentName: users[2].displayName,
        studentEmail: users[2].email,
        studentPhotoURL: '',
        opportunityId: opp2Ref.id,
        opportunityTitle: opportunities[1].title,
        orgId: org2Id,
        resumeURL: '',
        message: 'I have attached a link to my latest contemporary piece. Hope to see you on stage!',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const app of applications) {
      await db.collection('applications').add(app);
      
      await db.collection('opportunities').doc(app.opportunityId).update({
        applicationsCount: admin.firestore.FieldValue.increment(1)
      });
    }
    console.log(`✅ Created ${applications.length} applications.`);

    // 4. Create Achievements
    console.log('Creating achievements...');
    
    const achievements = [
      {
        userId: student2Id,
        title: 'Gold Medal - State Sprint Championship',
        description: 'Secured first place in the 100m dash at the state finals.',
        category: 'sports',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        mediaURL: '',
        mediaType: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        userId: student1Id,
        title: 'Best Choreography Award',
        description: 'Won best performance art piece at the Regional Arts Gala.',
        category: 'design', // arts/performance wasn't strictly in the categories list, using design/other
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        mediaURL: '',
        mediaType: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const ach of achievements) {
      await db.collection('achievements').add(ach);
      
      await db.collection('users').doc(ach.userId).update({
        achievementsCount: admin.firestore.FieldValue.increment(1)
      });
    }
    console.log(`✅ Created ${achievements.length} achievements.`);

    console.log('🎉 Seeding complete with sports & arts data!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
