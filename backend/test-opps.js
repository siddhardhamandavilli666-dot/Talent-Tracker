const { db } = require('./config/firebase');

async function check() {
  const opps = await db.collection('opportunities').get();
  console.log(`Found ${opps.size} opportunities directly from Firestore.`);
  opps.forEach(o => console.log(o.data().title));
  process.exit();
}
check();
