const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!key) {
      // Fallback to local file if no env var
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      serviceAccount = require(serviceAccountPath);
    } else if (key.trim().startsWith('{')) {
      // Handle JSON string from Env Var
      serviceAccount = JSON.parse(key);
    } else {
      // Handle file path from Env Var
      serviceAccount = require(path.resolve(key));
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        ...serviceAccount,
        private_key: serviceAccount.private_key?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`,
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('   Hint: Ensure FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON string or file path.');
    process.exit(1);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
