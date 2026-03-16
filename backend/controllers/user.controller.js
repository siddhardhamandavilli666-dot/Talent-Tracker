const { admin, db } = require('../config/firebase');
const { body, query } = require('express-validator');

const updateProfileValidators = [
  body('displayName').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('college').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio max 500 chars'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('portfolioLinks').optional().isObject(),
];

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      try {
        const authUser = await admin.auth().getUser(id);
        const newProfile = {
          uid: id,
          email: authUser.email || '',
          displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown',
          role: 'student',
          college: '',
          location: '',
          bio: '',
          skills: [],
          portfolioLinks: { github: '', linkedin: '', website: '' },
          photoURL: authUser.photoURL || '',
          verified: false,
          achievementsCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('users').doc(id).set(newProfile);
        return res.json(newProfile);
      } catch {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.json({ uid: id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const allowedFields = [
      'displayName', 'college', 'location', 'bio',
      'skills', 'portfolioLinks', 'photoURL',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(id).update(updates);

    if (updates.displayName) {
      await admin.auth().updateUser(id, { displayName: updates.displayName });
    }

    const updated = await db.collection('users').doc(id).get();
    res.json({ uid: id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { skill, college, location, role = 'student', page = 1, limit = 12 } = req.query;

    let ref = db.collection('users').where('role', '==', role);

    const snapshot = await ref.get();
    let users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    if (college) {
      users = users.filter((u) => u.college === college);
    }
    if (location) {
      users = users.filter((u) => u.location === location);
    }

    if (skill) {
      users = users.filter((u) =>
        u.skills && u.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = users.slice(startIdx, startIdx + limitNum);

    res.json({
      users: paginated,
      total: users.length,
      page: pageNum,
      totalPages: Math.ceil(users.length / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateProfileValidators,
  getUsers,
};
