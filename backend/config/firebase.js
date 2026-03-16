const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!key) {
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      serviceAccount = require(serviceAccountPath);
      console.log('📦 Using local serviceAccountKey.json');
    } else if (key.trim().startsWith('{')) {
      serviceAccount = JSON.parse(key);
      console.log('📝 Using JSON string from environment variable');
    } else {
      // Fallback: Assume it's Base64 encoded if it doesn't start with {
      try {
        const decoded = Buffer.from(key, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
        console.log('🔐 Using Base64 encoded credentials from environment variable');
      } catch (e) {
        // If not base64, try to require it as a path
        serviceAccount = require(path.resolve(key));
        console.log('📂 Using file path from environment variable');
      }
    }

    // Crucial: Fix newline characters in private_key
    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : undefined),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('   Hint: If on Render, ensure FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON or Base64 string.');
    // Don't exit immediately so we can see the logs on Render
    // process.exit(1); 
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
