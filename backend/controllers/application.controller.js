const { admin, db, bucket } = require('../config/firebase');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const applyValidators = [
  body('opportunityId').trim().notEmpty().withMessage('Opportunity ID required'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message 10-1000 chars'),
];

const applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId, message } = req.body;
    const studentId = req.user.uid;
    let resumeURL = '';

    const oppDoc = await db.collection('opportunities').doc(opportunityId).get();
    if (!oppDoc.exists) return res.status(404).json({ error: 'Opportunity not found' });
    if (oppDoc.data().status !== 'active') {
      return res.status(400).json({ error: 'Opportunity is no longer active' });
    }

    const existing = await db
      .collection('applications')
      .where('studentId', '==', studentId)
      .where('opportunityId', '==', opportunityId)
      .get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'You have already applied to this opportunity' });
    }

    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const uploadDir = path.join(__dirname, '../public/uploads/resumes');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      resumeURL = `${baseUrl}/uploads/resumes/${fileName}`;
    }

    const studentDoc = await db.collection('users').doc(studentId).get();
    const student = studentDoc.data();

    const applicationData = {
      studentId,
      studentName: student.displayName,
      studentEmail: student.email,
      studentPhotoURL: student.photoURL || '',
      opportunityId,
      opportunityTitle: oppDoc.data().title,
      orgId: oppDoc.data().orgId,
      resumeURL,
      message,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('applications').add(applicationData);

    await db.collection('opportunities').doc(opportunityId).update({
      applicationsCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(201).json({ id: docRef.id, ...applicationData });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getApplicantsByOpportunity = async (req, res) => {
  try {
    const { oppId } = req.params;

    const oppDoc = await db.collection('opportunities').doc(oppId).get();
    if (!oppDoc.exists) return res.status(404).json({ error: 'Opportunity not found' });

    if (oppDoc.data().orgId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const snapshot = await db
      .collection('applications')
      .where('opportunityId', '==', oppId)
      .get();

    const applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort in-memory instead of .orderBy to prevent composite index requirement
    applications.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.uid !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const snapshot = await db
      .collection('applications')
      .where('studentId', '==', studentId)
      .get();

    const applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort in-memory instead of .orderBy to prevent composite index requirement
    applications.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appDoc = await db.collection('applications').doc(id).get();
    if (!appDoc.exists) return res.status(404).json({ error: 'Application not found' });

    const oppDoc = await db.collection('opportunities').doc(appDoc.data().opportunityId).get();
    if (oppDoc.data().orgId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('applications').doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: `Application ${status}`, id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  applyToOpportunity,
  getApplicantsByOpportunity,
  getStudentApplications,
  updateApplicationStatus,
  applyValidators,
};
