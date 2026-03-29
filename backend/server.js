import dotenv from 'dotenv';
dotenv.config(); // Must be first so env vars are available to all imports below

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initializePushService } from './services/pushService.js';

import Service from './models/Service.js';

// Connect to database
connectDB().then(async () => {
  try {
    const servicesToMigrate = await Service.find({ providers: { $exists: false } });
    if (servicesToMigrate.length > 0) {
      for (const s of servicesToMigrate) {
        if (s.provider && (!s.providers || s.providers.length === 0)) {
          s.providers = [s.provider];
        } else if (!s.providers) {
          s.providers = [];
        }
        await s.save();
      }
      console.log(`Migrated ${servicesToMigrate.length} services to apply new array providers schema.`);
    }
  } catch (err) {
    console.error('Migration failed silently:', err.message);
  }
});

const app = express();

// Body parser with 10MB limit for Base64 image strings
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS — strictly accepting requests from the generated Vercel string or local dev bounds
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'] 
    : true, // fallback if user forgets to define it
  credentials: true,
}));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'HomeServe API is running ✅', status: 'ok' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Spin up VAPID crypto services silently injecting environment keys
initializePushService();

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}\n`);
});
