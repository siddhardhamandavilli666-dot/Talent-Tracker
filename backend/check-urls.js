const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection('achievements').limit(5).get().then(snapshot => {
  console.log('Docs found:', snapshot.size);
  snapshot.forEach(doc => {
    console.log('Achievement URL:', doc.data().mediaURL);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
