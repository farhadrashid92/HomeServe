import express from 'express';
import { sendMessage, getConversations, getMessages, getUnreadCount } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Extracted routes securely enforcing the JWT headers mathematically dropping user.id implicitly into controllers
router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);

export default router;
