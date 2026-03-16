const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    console.log('🔍 Firebase Debug: Checking FIREBASE_SERVICE_ACCOUNT_KEY...');

    if (!key) {
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      serviceAccount = require(serviceAccountPath);
      console.log('📦 Using local serviceAccountKey.json file');
    } else if (key.trim().startsWith('{')) {
      serviceAccount = JSON.parse(key);
      console.log('📝 Using raw JSON string from environment variable (Length: ' + key.length + ')');
    } else {
      try {
        const decoded = Buffer.from(key.trim(), 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
        console.log('🔐 Using Base64 encoded credentials (Length: ' + key.length + ')');
      } catch (e) {
        console.log('📂 Falling back to file path interpretation (Not JSON or Base64)');
        serviceAccount = require(path.resolve(key));
      }
    }

    if (serviceAccount && serviceAccount.private_key) {
      // Fix both escaped newlines and literal newlines
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : undefined),
    });
    console.log('✅ Firebase Admin initialized successfully for project:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
