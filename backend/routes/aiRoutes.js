import express from 'express';
import { bookingExtract } from '../controllers/aiController.js';

const router = express.Router();

router.post('/booking-extract', bookingExtract);

export default router;
