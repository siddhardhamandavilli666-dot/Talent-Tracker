const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.storage().bucket().getFiles()
  .then(() => console.log('Default bucket works'))
  .catch(err => console.log('Default bucket error:', err.message));

admin.storage().getBuckets().then(data => {
  const buckets = data[0];
  console.log('Buckets:');
  buckets.forEach(b => console.log(b.name));
}).catch(err => console.error('Error listing buckets:', err.message));
