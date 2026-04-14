const { admin, db } = require('../config/firebase');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');

const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('displayName').trim().notEmpty().withMessage('Display name required'),
  body('role')
    .isIn(['student', 'organization'])
    .withMessage('Role must be student or organization'),
];

const register = async (req, res) => {
  try {
    const { email, password, displayName, role, college, location, bio } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const tokenEmail = (decodedToken.email || '').toLowerCase();
    const requestEmail = (email || '').toLowerCase();

    if (tokenEmail !== requestEmail) {
      return res.status(400).json({ error: 'Email mismatch between token and request' });
    }

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(uid, { role });

    // Hash password for secondary storage
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userProfile = {
      uid,
      email,
      displayName,
      role,
      passwordHash, // Store hashed password
      college: college || '',
      location: location || '',
      bio: bio || '',
      skills: [],
      portfolioLinks: { github: '', linkedin: '', website: '' },
      photoURL: '',
      verified: false,
      achievementsCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userProfile);

    res.status(201).json({
      message: 'User profile created successfully',
      uid,
      role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      uid: req.user.uid,
      ...req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { uid, role } = req.body;
    if (!['student', 'organization', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await admin.auth().setCustomUserClaims(uid, { role });
    await db.collection('users').doc(uid).update({ role });
    res.json({ message: `Role updated to ${role} for user ${uid}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Google OAuth Registration (idempotent) ──────────────────────
const googleRegister = async (req, res) => {
  try {
    const { displayName, email, role, photoURL } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if user profile already exists – if so, just return it
    const existingDoc = await db.collection('users').doc(uid).get();
    if (existingDoc.exists) {
      return res.status(200).json({
        message: 'User already registered',
        uid,
        role: existingDoc.data().role,
      });
    }

    // Validate role
    const validRole = ['student', 'organization'].includes(role) ? role : 'student';

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(uid, { role: validRole });

    const userProfile = {
      uid,
      email: email || decodedToken.email || '',
      displayName: displayName || decodedToken.name || 'Google User',
      role: validRole,
      authProvider: 'google',
      college: '',
      location: '',
      bio: '',
      skills: [],
      portfolioLinks: { github: '', linkedin: '', website: '' },
      photoURL: photoURL || decodedToken.picture || '',
      verified: true, // Google accounts are pre-verified
      achievementsCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userProfile);

    res.status(201).json({
      message: 'Google user profile created successfully',
      uid,
      role: validRole,
    });
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({ error: error.message || 'Google registration failed' });
  }
};

module.exports = { register, getMe, updateRole, googleRegister, registerValidators };
