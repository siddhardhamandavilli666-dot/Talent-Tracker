const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
  getAllUsers,
  verifyUserProfile,
  deleteUser,
  deleteAchievementAdmin,
  getStats,
} = require('../controllers/admin.controller');

router.use(verifyToken, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUserProfile);
router.delete('/users/:id', deleteUser);
router.delete('/achievements/:id', deleteAchievementAdmin);

module.exports = router;
