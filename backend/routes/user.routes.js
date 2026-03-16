const express = require('express');
const router = express.Router();
const { verifyToken, requireRole, optionalAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  getUserProfile,
  updateUserProfile,
  updateProfileValidators,
  getUsers,
} = require('../controllers/user.controller');

router.get('/', verifyToken, getUsers);

router.get('/:id', verifyToken, getUserProfile);

router.put('/:id', verifyToken, updateProfileValidators, validate, updateUserProfile);

module.exports = router;
