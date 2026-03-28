import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import connectDB from './config/db.js';

dotenv.config();

const CATEGORY_DEFAULTS = {
  Cleaning:     { title: 'Home Cleaning Service',      description: 'Professional home cleaning services including deep cleaning, regular maintenance, kitchen and bathroom sanitization.' },
  Maintenance:  { title: 'AC Repair & Maintenance',    description: 'Expert AC installation, repair, gas refilling, filter cleaning, and full servicing for all brands.' },
  Electrical:   { title: 'Electrical Services',        description: 'Licensed electrician for wiring, fuse box work, appliance installation, fault finding, and safety checks.' },
  Plumbing:     { title: 'Plumbing Services',          description: 'Expert plumber for leaks, blockages, pipe fitting, water heater installation, and bathroom fittings.' },
  'Pest Control': { title: 'Pest Control Services',   description: 'Safe and effective treatment for cockroaches, ants, bedbugs, rodents, and termites.' },
  Painting:     { title: 'Painting Services',          description: 'Interior and exterior wall painting with premium quality paints and professional finish.' },
  Carpenter:    { title: 'Carpentry Services',         description: 'Custom furniture, door/window fitting, cabinet installation, and woodwork repairs.' },
  'CCTV Installation': { title: 'CCTV Installation',  description: 'Install and configure security cameras, DVR/NVR systems, and remote viewing setup.' },
  Gardening:    { title: 'Gardening Services',         description: 'Lawn mowing, plant care, garden design, and seasonal maintenance.' },
  'Home Shifting': { title: 'Home Shifting Services', description: 'Safe packing, loading, transport, and unpacking of household belongings.' },
};

const runSeed = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding');

    let addedCount = 0;
    for (const [cat, data] of Object.entries(CATEGORY_DEFAULTS)) {
      const exists = await Service.findOne({ category: cat });
      if (!exists) {
        await Service.create({
          title: data.title,
          description: data.description,
          category: cat,
          price: 1500,
          image: `https://source.unsplash.com/800x600/?${encodeURIComponent(cat)}`,
          providers: [],
          rating: 0,
          reviewsCount: 0
        });
        console.log(`Created missing category: ${cat}`);
        addedCount++;
      }
    }

    console.log(`Seeding Complete. Added ${addedCount} missing categories.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
