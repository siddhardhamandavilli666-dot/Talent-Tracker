const { Storage } = require('@google-cloud/storage');
const path = require('path');
const serviceAccount = require('./config/serviceAccountKey.json');

async function listBuckets() {
  try {
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      keyFilename: path.resolve('./config/serviceAccountKey.json'),
    });

    const [buckets] = await storage.getBuckets();
    console.log('Buckets found:');
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name}`);
    });
    
    if (buckets.length === 0) {
      console.log('No buckets found in this project.');
    }
  } catch (error) {
    console.error('Error listing buckets:', error.message);
  }
}

listBuckets();
