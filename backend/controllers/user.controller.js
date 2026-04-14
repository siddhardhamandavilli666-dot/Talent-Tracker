const { admin, db } = require('../config/firebase');
const { body, query } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const { role, location, skill } = req.query;

    let queryRef = db.collection('users');
    
    if (role) {
      queryRef = queryRef.where('role', '==', role);
    }
    
    if (location) {
      queryRef = queryRef.where('location', '==', location);
    }

    const snapshot = await queryRef.get();
    let users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    // In-memory search for skills/name (Firestore doesn't support easy multi-field partial search without specific setup)
    if (skill) {
      const searchLower = skill.toLowerCase();
      users = users.filter(user => 
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.skills?.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // Sort in-memory to prevent composite index requirements
    users.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    const total = users.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedUsers = users.slice(startIdx, startIdx + limit);

    res.json({
      users: paginatedUsers,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(__dirname, '../public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoURL = `${baseUrl}/uploads/profiles/${fileName}`;

    await db.collection('users').doc(id).set({
      photoURL,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    try {
      await admin.auth().updateUser(id, { photoURL });
    } catch(err) {
      console.log('Firebase Auth error (non-fatal):', err.message);
    }

    res.json({ photoURL });
  } catch (error) {
    console.error('Photo Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateProfileValidators,
  getUsers,
  uploadProfilePhoto,
};
