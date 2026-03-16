const { Storage } = require('@google-cloud/storage');
const path = require('path');
const serviceAccount = require('./config/serviceAccountKey.json');

async function createBucket() {
  try {
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      keyFilename: path.resolve('./config/serviceAccountKey.json'),
    });

    const bucketName = `${serviceAccount.project_id}.firebasestorage.app`;
    console.log(`Attempting to create bucket: ${bucketName}...`);

    await storage.createBucket(bucketName, {
      location: 'US',
      storageClass: 'STANDARD',
    });

    console.log(`✅ Bucket ${bucketName} created successfully!`);
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    
    if (error.message.includes('permission')) {
        console.log('Permission denied. Please enable Storage in the Firebase Console manually.');
    }
  }
}

createBucket();
