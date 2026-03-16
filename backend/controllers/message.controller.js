const { db, admin } = require('../config/firebase');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;
    const senderId = req.user.uid;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderName = senderDoc.exists ? senderDoc.data().displayName : 'An Organization';
    const senderPhoto = senderDoc.exists ? senderDoc.data().photoURL : '';

    const message = {
      senderId,
      senderName,
      senderPhoto,
      receiverId,
      content,
      type: type || 'direct', // 'direct', 'hire', 'reject'
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('messages').add(message);

    res.status(201).json({ id: docRef.id, ...message, createdAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('messages').where('receiverId', '==', userId).get();
    
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
      };
    }).sort((a, b) => b.createdAt - a.createdAt);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const messageRef = db.collection('messages').doc(id);
    const doc = await messageRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (doc.data().receiverId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await messageRef.update({ read: true });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMyMessages,
  markAsRead
};
