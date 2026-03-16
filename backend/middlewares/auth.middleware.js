const { admin, db } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    let userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      try {
        const authUser = await admin.auth().getUser(decodedToken.uid);
        const newProfile = {
          uid: decodedToken.uid,
          email: decodedToken.email || authUser.email || '',
          displayName: authUser.displayName || decodedToken.email?.split('@')[0] || 'Unknown',
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
        await db.collection('users').doc(decodedToken.uid).set(newProfile);
        userDoc = await db.collection('users').doc(decodedToken.uid).get();
      } catch (createErr) {
        console.error('Failed to auto-create user profile:', createErr.message);
        return res.status(404).json({ error: 'User profile not found' });
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userDoc.data().role || 'student',
      ...userDoc.data(),
    };

    next();
  } catch (error) {
    console.error('🔓 Token verification failed:', error.message);
    if (error.code) console.error('   Error Code:', error.code);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired, please login again' });
    }
    
    // Check for "aud" (audience) mismatch which happens if project IDs don't match
    if (error.message.includes('aud') || error.message.includes('audience')) {
      console.error('🚨 PROJECT MISMATCH: The frontend token does not match the backend project ID.');
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
      req.user = { uid: decodedToken.uid, ...userDoc.data() };
    }
  } catch {
  }
  next();
};

module.exports = { verifyToken, requireRole, optionalAuth };
