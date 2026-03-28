import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcrypt';

dotenv.config();

const HD_IMAGES = {
  Painting: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
  Carpenter: 'https://images.unsplash.com/photo-1505015920881-0f6cebe82cb0?auto=format&fit=crop&q=80&w=800',
  'CCTV Installation': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800',
  Gardening: 'https://images.unsplash.com/photo-1416879598555-46e8aeaf31bb?auto=format&fit=crop&q=80&w=800',
  'Home Shifting': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&q=80&w=800'
};

const DUMMY_PROVIDERS = [
  { name: 'Ali Raza', email: 'ali.painter@example.com', phone: '0300-1111111', category: 'Painting', address: 'Lahore', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { name: 'Kamran Qureshi', email: 'kamran.wood@example.com', phone: '0311-2222222', category: 'Carpenter', address: 'Karachi', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Saad Farooq', email: 'saad.security@example.com', phone: '0322-3333333', category: 'CCTV Installation', address: 'Islamabad', profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Zainab Akhtar', email: 'zainab.garden@example.com', phone: '0333-4444444', category: 'Gardening', address: 'Faisalabad', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
  { name: 'Waqas Ahmed', email: 'waqas.movers@example.com', phone: '0344-5555555', category: 'Home Shifting', address: 'Rawalpindi', profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' }
];

const runFix = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Fixes');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (const [category, imageUrl] of Object.entries(HD_IMAGES)) {
      await Service.updateOne({ category }, { $set: { image: imageUrl } });
      console.log(`Updated image for ${category}`);
    }

    for (const p of DUMMY_PROVIDERS) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        user = await User.create({
          name: p.name,
          email: p.email,
          password: hashedPassword,
          role: 'provider',
          phone: p.phone,
          profileImage: p.profileImage,
          address: p.address
        });
        console.log(`Created dummy provider: ${p.name}`);

        const service = await Service.findOne({ category: p.category });
        if (service) {
          await Service.updateOne(
            { _id: service._id },
            { $addToSet: { providers: user._id } }
          );
          console.log(`Assigned ${p.name} to ${p.category} service`);
          
          if (service.providers.length === 0) {
            // Give them a fake good rating initially so it looks nice
            await Service.updateOne({ _id: service._id }, { $set: { rating: 4.8, reviewsCount: 14 } });
          }
        }
      } else {
        console.log(`Provider ${p.name} already exists`);
      }
    }

    console.log(`Fixes Complete.`);
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
};

runFix();
