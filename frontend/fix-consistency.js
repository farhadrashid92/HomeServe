import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import Service from './backend/models/Service.js';

dotenv.config({ path: './backend/.env' });

const CATEGORY_DEFAULTS = {
  Cleaning:     { title: 'Home Cleaning Service',      description: 'Professional home cleaning services.' },
  Maintenance:  { title: 'AC Repair & Maintenance',    description: 'Expert AC installation and repair.' },
  Electrical:   { title: 'Electrical Services',        description: 'Licensed electrician services.' },
  Plumbing:     { title: 'Plumbing Services',          description: 'Expert plumbing services.' },
  'Pest Control': { title: 'Pest Control Services',   description: 'Safe and effective pest treatment.' },
  Painting:     { title: 'Painting Services',          description: 'Professional painting services.' },
  Carpenter:    { title: 'Carpentry Services',         description: 'Custom carpentry and woodwork.' },
  'CCTV Installation': { title: 'CCTV Installation',  description: 'Security camera installation.' },
  Gardening:    { title: 'Gardening Services',         description: 'Professional gardening services.' },
  'Home Shifting': { title: 'Home Shifting Services', description: 'Safe home shifting services.' },
};

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homeserve');
    console.log('MongoDB Connected for Migration');

    const providers = await User.find({ role: 'provider' });
    let createdCount = 0;

    for (const provider of providers) {
      const existingService = await Service.findOne({ provider: provider._id });
      
      if (!existingService) {
        // Fallback category if we don't know it
        const category = 'Cleaning'; 
        const defaults = CATEGORY_DEFAULTS[category];

        await Service.create({
          title: `${provider.name}'s ${defaults.title}`,
          description: defaults.description,
          category,
          price: 1000,
          provider: provider._id,
        });
        createdCount++;
        console.log(`Created missing service for provider: ${provider.name}`);
      }
    }

    console.log(`Migration Complete. Created ${createdCount} missing services.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
