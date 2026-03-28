import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getVapidKey, subscribeUser, unsubscribeUser } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/vapid-key', getVapidKey);
router.post('/subscribe', protect, subscribeUser);
router.post('/unsubscribe', protect, unsubscribeUser);

export default router;
