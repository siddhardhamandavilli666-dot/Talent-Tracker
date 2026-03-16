const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = path.resolve('./config/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

console.log('--- Test 1: firebasestorage.app ---');
const app1 = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
}, 'app1');

const bucket1 = app1.storage().bucket();
bucket1.exists().then(data => {
  console.log('App 1 bucket exists?', data[0]);
}).catch(err => {
  console.log('App 1 bucket error:', err.message);
}).finally(() => {
  
  console.log('\n--- Test 2: appspot.com ---');
  const app2 = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  }, 'app2');

  const bucket2 = app2.storage().bucket();
  bucket2.exists().then(data => {
    console.log('App 2 bucket exists?', data[0]);
    process.exit(0);
  }).catch(err => {
    console.log('App 2 bucket error:', err.message);
    process.exit(1);
  });
});
