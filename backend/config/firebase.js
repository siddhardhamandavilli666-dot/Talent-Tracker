const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Attempt 1: Full JSON Base64 (The "Nuclear" Option - Most Reliable)
    if (process.env.FIREBASE_CONFIG_BASE64) {
      console.log('🧪 Initializing via FIREBASE_CONFIG_BASE64 (Full JSON)');
      const decoded = Buffer.from(process.env.FIREBASE_CONFIG_BASE64.trim(), 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    }
    // Attempt 2: Individual Env Vars
    else if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('✅ Found individual Firebase environment variables');
      
      let pk = process.env.FIREBASE_PRIVATE_KEY.trim();
      pk = pk.replace(/^['"]|['"]$/g, ''); // Remove accidental quotes
      
      // If NOT starting with the standard PEM header, assume it's Base64
      if (!pk.startsWith('-----BEGIN')) {
        console.log('🗝️ Decoding Base64 private key');
        try {
          pk = Buffer.from(pk, 'base64').toString('utf8');
        } catch (e) {
          console.error('❌ Base64 decoding failed');
        }
      }

      serviceAccount = {
        project_id: (process.env.FIREBASE_PROJECT_ID || '').trim(),
        client_email: (process.env.FIREBASE_CLIENT_EMAIL || '').trim(),
        private_key: pk,
      };
    } 
    // Attempt 3: JSON from Env Var (Standard)
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
    // Attempt 4: Local File Fallback
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
      // Hyper-robust PEM string cleaning for ALL methods
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key
          .replace(/\\n/g, '\n')           // Fix escaped newlines
          .replace(/^['"]|['"]$/g, '')    // Remove accidental quotes
          .trim();
          
        if (!serviceAccount.private_key.includes('\n')) {
          console.error('⚠️ Critical: Private key has NO newlines. PEM format will likely fail.');
        }
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
