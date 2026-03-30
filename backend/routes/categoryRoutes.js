import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: anyone can list categories
router.route('/').get(getCategories);

// Admin-only: create, update, delete
router.route('/').post(protect, admin, createCategory);
router.route('/:id').put(protect, admin, updateCategory);
router.route('/:id').delete(protect, admin, deleteCategory);

export default router;
