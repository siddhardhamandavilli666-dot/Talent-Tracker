const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./backend/config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listApps() {
  try {
    const snap = await db.collection('applications').get();
    console.log(`Total apps: ${snap.size}`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Student: ${data.studentId} | Opp: ${data.opportunityId} | Title: ${data.opportunityTitle}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

listApps();
