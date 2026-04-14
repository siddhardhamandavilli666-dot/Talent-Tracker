const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  register,
  getMe,
  updateRole,
  googleRegister,
  registerValidators,
} = require('../controllers/auth.controller');

router.post('/register', registerValidators, validate, register);

router.post('/google-register', googleRegister);

router.get('/me', verifyToken, getMe);

router.post('/update-role', verifyToken, requireRole('admin'), updateRole);

module.exports = router;
