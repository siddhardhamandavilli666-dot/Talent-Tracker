const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { upload } = require('../middlewares/upload.middleware');
const {
  applyToOpportunity,
  getApplicantsByOpportunity,
  getStudentApplications,
  updateApplicationStatus,
  applyValidators,
} = require('../controllers/application.controller');

router.post(
  '/',
  verifyToken,
  requireRole('student'),
  upload.single('resume'),
  applyValidators,
  validate,
  applyToOpportunity
);

router.get('/opportunity/:oppId', verifyToken, requireRole('organization', 'admin'), getApplicantsByOpportunity);

router.get('/student/:studentId', verifyToken, getStudentApplications);

router.put('/:id', verifyToken, requireRole('organization', 'admin'), updateApplicationStatus);

module.exports = router;
