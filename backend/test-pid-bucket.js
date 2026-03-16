const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'talent-tracker-b4e82'
});

const bucket = admin.storage().bucket();
bucket.exists().then(data => {
  console.log('Project ID bucket exists?', data[0]);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
