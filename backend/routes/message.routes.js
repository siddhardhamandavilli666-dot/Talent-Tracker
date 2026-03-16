const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
  sendMessage,
  getMyMessages,
  markAsRead
} = require('../controllers/message.controller');

router.post('/', verifyToken, requireRole('organization'), sendMessage);

router.get('/', verifyToken, getMyMessages);

router.put('/:id/read', verifyToken, markAsRead);

module.exports = router;
