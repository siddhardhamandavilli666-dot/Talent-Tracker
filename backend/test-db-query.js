const { admin, db } = require('./config/firebase');

async function testQuery() {
  try {
    console.log('Testing query without orderBy...');
    const snapshot1 = await db.collection('applications').get();
    console.log(`Total applications found: ${snapshot1.size}`);
    snapshot1.forEach(doc => {
      console.log(`Doc ID: ${doc.id}, studentId: ${doc.data().studentId}`);
    });

    if (snapshot1.size > 0) {
      const firstStudentId = snapshot1.docs[0].data().studentId;
      console.log(`Testing query for studentId: ${firstStudentId} with orderBy...`);
      try {
        const snapshot2 = await db.collection('applications')
          .where('studentId', '==', firstStudentId)
          .orderBy('createdAt', 'desc')
          .get();
        console.log(`Query with orderBy successful. Found ${snapshot2.size} docs.`);
      } catch (err) {
        console.error('Query with orderBy FAILED:', err.message);
      }
    }
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

testQuery();
