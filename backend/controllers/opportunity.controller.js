const { admin, db } = require('../config/firebase');
const { body } = require('express-validator');

const opportunityValidators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('category')
    .isIn(['internship', 'competition', 'scholarship', 'volunteering', 'job', 'other'])
    .withMessage('Invalid category'),
  body('deadline').isISO8601().withMessage('Valid deadline date required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('eligibility').trim().notEmpty().withMessage('Eligibility required'),
];

const createOpportunity = async (req, res) => {
  try {
    const { title, description, category, deadline, location, eligibility } = req.body;

    const orgDoc = await db.collection('users').doc(req.user.uid).get();
    const orgName = orgDoc.exists ? orgDoc.data().displayName : 'Unknown Org';

    const opportunityData = {
      orgId: req.user.uid,
      orgName,
      title,
      description,
      category,
      deadline,
      location,
      eligibility,
      status: 'active',
      applicationsCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('opportunities').add(opportunityData);
    res.status(201).json({ id: docRef.id, ...opportunityData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOpportunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const status = req.query.status;
    const category = req.query.category;

    let queryRef = db.collection('opportunities');
    if (status) queryRef = queryRef.where('status', '==', status);
    if (category) queryRef = queryRef.where('category', '==', category);

    const snapshot = await queryRef.get();
    let opportunities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    opportunities.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
      const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    const total = opportunities.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedOpps = opportunities.slice(startIdx, startIdx + limit);

    res.json({
      opportunities: paginatedOpps,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOpportunity = async (req, res) => {
  try {
    const doc = await db.collection('opportunities').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('opportunities').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Opportunity not found' });

    if (doc.data().orgId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowedFields = ['title', 'description', 'category', 'deadline', 'location', 'eligibility', 'status'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('opportunities').doc(id).update(updates);
    res.json({ message: 'Opportunity updated', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('opportunities').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Opportunity not found' });

    if (doc.data().orgId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('opportunities').doc(id).delete();
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  opportunityValidators,
};
