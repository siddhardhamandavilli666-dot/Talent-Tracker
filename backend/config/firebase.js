const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Attempt 1: Individual Env Vars
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('✅ Found individual Firebase environment variables');
      
      // Hyper-robust PEM string cleaning
      let pk = process.env.FIREBASE_PRIVATE_KEY.trim();
      // Remove accidental quotes if they exist
      if ((pk.startsWith('"') && pk.endsWith('"')) || (pk.startsWith("'") && pk.endsWith("'"))) {
        pk = pk.substring(1, pk.length - 1);
      }
      // Replace literal \n with actual newlines
      pk = pk.replace(/\\n/g, '\n');

      serviceAccount = {
        project_id: (process.env.FIREBASE_PROJECT_ID || '').trim(),
        client_email: (process.env.FIREBASE_CLIENT_EMAIL || '').trim(),
        private_key: pk,
      };
    } 
    // Attempt 2: JSON from Env Var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (key.startsWith('{')) {
        serviceAccount = JSON.parse(key);
        console.log('📝 Initializing via JSON string');
      } else {
        const decoded = Buffer.from(key, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
        console.log('🔐 Initializing via Base64 string');
      }
    } 
    // Attempt 3: Local File Fallback
    else {
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      try {
        serviceAccount = require(serviceAccountPath);
        console.log('📦 Initializing via local file');
      } catch (e) {
        throw new Error('No Firebase credentials found in environment variables or serviceAccountKey.json');
      }
    }

    if (serviceAccount) {
      // Final normalization for private_key if it came from JSON
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : undefined),
      });
      console.log('🚀 Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    process.exit(1); // Force exit so Render restarts or shows a clear error
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
