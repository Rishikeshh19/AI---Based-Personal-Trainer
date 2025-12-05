const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Send a message
router.post('/', messageController.sendMessage);

// Get conversation with a specific user
router.get('/:userId', messageController.getConversation);

// Get all conversations
router.get('/', messageController.getConversations);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

// Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;
