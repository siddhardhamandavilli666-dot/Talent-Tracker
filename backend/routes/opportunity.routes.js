const express = require('express');
const router = express.Router();
const { verifyToken, requireRole, optionalAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  opportunityValidators,
} = require('../controllers/opportunity.controller');

router.get('/', optionalAuth, getOpportunities);

router.get('/:id', optionalAuth, getOpportunity);

router.post('/', verifyToken, requireRole('organization'), opportunityValidators, validate, createOpportunity);

router.put('/:id', verifyToken, requireRole('organization', 'admin'), updateOpportunity);

router.delete('/:id', verifyToken, requireRole('organization', 'admin'), deleteOpportunity);

module.exports = router;
