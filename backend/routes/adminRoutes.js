import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAdminAnalytics, getAdminUsers, getAdminServices, getAdminBookings, deleteUser, deleteService } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, admin);

router.route('/analytics').get(getAdminAnalytics);
router.route('/users').get(getAdminUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/services').get(getAdminServices);
router.route('/services/:id').delete(deleteService);
router.route('/bookings').get(getAdminBookings);

export default router;
