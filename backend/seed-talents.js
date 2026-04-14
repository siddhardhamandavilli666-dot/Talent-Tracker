const { admin, db } = require('./config/firebase');

async function manageTalents() {
  console.log('🧹 Cleaning up talent list...');

  try {
    const snapshot = await db.collection('users').get();
    let deleteCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const isStudent = data.role === 'student';
      const isNarasimha = data.displayName?.toLowerCase().includes('narasimha');

      // Remove students that are NOT Narasimha
      if (isStudent && !isNarasimha) {
        await doc.ref.delete();
        deleteCount++;
      }
    }
    console.log(`✅ Removed ${deleteCount} non-target talents.`);

    console.log('🌱 Seeding new diverse talents...');
    const newTalents = [
      {
        uid: `talent_singer_${Date.now()}`,
        email: 'ravi_shankar@example.com',
        displayName: 'Ravi Shankar',
        role: 'student',
        bio: 'Hindustani Classical Vocalist with 15+ years of training. Performing globally.',
        college: 'N/A',
        location: 'Mumbai, India',
        skills: ['Classical Singing', 'Harmonium', 'Vocal Coaching'],
        achievementsCount: 1,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: `talent_skate_${Date.now() + 1}`,
        email: 'sarah_skate@example.com',
        displayName: 'Sarah Miller',
        role: 'student',
        bio: 'Professional skateboarder and X-Games enthusiast. Street and park specialist.',
        college: 'N/A',
        location: 'London, UK',
        skills: ['Skateboarding', 'Balance', 'Street Stunts'],
        achievementsCount: 2,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: `talent_magic_${Date.now() + 2}`,
        email: 'liam_magic@example.com',
        displayName: 'Liam The Illusionist',
        role: 'student',
        bio: 'Close-up magician and mentalist. Entertaining crowds from Vegas to NYC.',
        college: 'N/A',
        location: 'Las Vegas, NV',
        skills: ['Slight of Hand', 'Mentalism', 'Crowd Interaction'],
        achievementsCount: 1,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: `talent_art_${Date.now() + 3}`,
        email: 'priya_art@example.com',
        displayName: 'Priya Verma',
        role: 'student',
        bio: 'Street artist and muralist. Transforming urban spaces with vibrant stories.',
        college: 'N/A',
        location: 'Bangalore, India',
        skills: ['Mural Painting', 'Spray Art', 'Visual Storytelling'],
        achievementsCount: 3,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: `talent_football_${Date.now() + 4}`,
        email: 'david_goals@example.com',
        displayName: 'David Silva',
        role: 'student',
        bio: 'Freestyle footballer. Combining core strength with precision ball control.',
        college: 'N/A',
        location: 'Rio de Janeiro, Brazil',
        skills: ['Freestyle Football', 'Ball Control', 'Core Strength'],
        achievementsCount: 1,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
    ];

    for (const talent of newTalents) {
      await db.collection('users').doc(talent.uid).set(talent);
    }
    console.log(`✅ Successfully added ${newTalents.length} new talented creators.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during talent management:', err);
    process.exit(1);
  }
}

manageTalents();
