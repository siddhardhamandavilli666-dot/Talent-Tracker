const { admin, db, bucket } = require('../config/firebase');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const achievementValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['sports', 'music', 'design', 'leadership', 'volunteering', 'technical', 'academic', 'other'])
    .withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date required'),
];

const uploadAchievement = async (req, res) => {
  try {
    const { title, description, category, date } = req.body;
    const userId = req.user.uid;
    let mediaURL = '';
    let mediaType = '';

    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const uploadDir = path.join(__dirname, '../public/uploads/achievements');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      mediaURL = `${baseUrl}/uploads/achievements/${fileName}`;
      mediaType = req.file.mimetype.startsWith('image')
        ? 'image'
        : req.file.mimetype.startsWith('video')
        ? 'video'
        : 'document';
    }

    const achievementData = {
      userId,
      title,
      description,
      category,
      date,
      mediaURL,
      mediaType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('achievements').add(achievementData);

    await db.collection('users').doc(userId).update({
      achievementsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({ id: docRef.id, ...achievementData });
  } catch (error) {
    console.error('Achievement upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db
      .collection('achievements')
      .where('userId', '==', userId)
      .get();

    const achievements = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? 0;
        const bTime = b.createdAt?._seconds ?? 0;
        return bTime - aTime;
      });

    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('achievements').doc(id).get();

    if (!doc.exists) return res.status(404).json({ error: 'Achievement not found' });

    const achievement = doc.data();

    if (achievement.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (achievement.mediaURL && achievement.mediaURL.includes('/uploads/')) {
      try {
        const urlPart = achievement.mediaURL.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../public/uploads', urlPart);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (storageErr) {
        console.warn('Local file deletion warning:', storageErr.message);
      }
    }

    await db.collection('achievements').doc(id).delete();

    await db.collection('users').doc(achievement.userId).update({
      achievementsCount: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadAchievement, getAchievements, deleteAchievement, achievementValidators };
