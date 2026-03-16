const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { upload } = require('../middlewares/upload.middleware');
const {
  uploadAchievement,
  getAchievements,
  deleteAchievement,
  achievementValidators,
} = require('../controllers/achievement.controller');

router.post(
  '/',
  verifyToken,
  requireRole('student'),
  upload.single('media'),
  achievementValidators,
  validate,
  uploadAchievement
);

router.get('/:userId', getAchievements);

router.delete('/:id', verifyToken, deleteAchievement);

module.exports = router;
