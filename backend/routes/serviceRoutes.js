import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorizeRoles('provider', 'admin'), createService); // In practice protect middleware required

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorizeRoles('provider', 'admin'), updateService)
  .delete(protect, authorizeRoles('provider', 'admin'), deleteService);

export default router;
