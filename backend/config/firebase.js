const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Attempt 1: Individual Env Vars (Most Reliable for Production)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('✅ Found individual Firebase environment variables');
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
      
      // Fix private key if using JSON object
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    } 
    // Attempt 3: Local File
    else {
      const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
      serviceAccount = require(serviceAccountPath);
      console.log('📦 Initializing via local file');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id || serviceAccount.projectId ? `${serviceAccount.project_id || serviceAccount.projectId}.firebasestorage.app` : undefined),
    });
    
    console.log('🚀 Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
