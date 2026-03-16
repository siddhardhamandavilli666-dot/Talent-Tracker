const { admin, db } = require('../config/firebase');

const getAllUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 20 } = req.query;
    let ref = db.collection('users');
    if (role) ref = ref.where('role', '==', role);
    if (verified !== undefined) ref = ref.where('verified', '==', verified === 'true');

    const snapshot = await ref.get();
    let users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    users.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ users: paginated, total: users.length, page: pageNum });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    await db.collection('users').doc(id).update({
      verified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Profile verified successfully', uid: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    await admin.auth().deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAchievementAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('achievements').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Achievement not found' });

    const { userId } = doc.data();
    await db.collection('achievements').doc(id).delete();
    await db.collection('users').doc(userId).update({
      achievementsCount: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ message: 'Achievement removed by admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [usersSnap, achievementsSnap, opportunitiesSnap, applicationsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('achievements').get(),
      db.collection('opportunities').get(),
      db.collection('applications').get(),
    ]);

    const users = usersSnap.docs.map((d) => d.data());

    res.json({
      totalUsers: usersSnap.size,
      students: users.filter((u) => u.role === 'student').length,
      organizations: users.filter((u) => u.role === 'organization').length,
      totalAchievements: achievementsSnap.size,
      totalOpportunities: opportunitiesSnap.size,
      totalApplications: applicationsSnap.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, verifyUserProfile, deleteUser, deleteAchievementAdmin, getStats };
