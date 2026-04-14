const express = require('express');
const router = express.Router();
const { verifyToken, requireRole, optionalAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { upload } = require('../middlewares/upload.middleware');
const {
  getUserProfile,
  updateUserProfile,
  updateProfileValidators,
  getUsers,
  uploadProfilePhoto,
} = require('../controllers/user.controller');

router.get('/', optionalAuth, getUsers);

router.post('/:id/photo', verifyToken, upload.single('photo'), uploadProfilePhoto);

router.get('/:id', optionalAuth, getUserProfile);

router.put('/:id', verifyToken, updateProfileValidators, validate, updateUserProfile);

module.exports = router;
