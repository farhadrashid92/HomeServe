import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Service.deleteMany({});
    await User.deleteMany({ role: 'provider' });
    console.log('Cleared existing services and providers.');

    // ─── Create distinct providers per service category ───────────────────────
    const providers = await User.insertMany([
      {
        name: 'Ahmad Khan',
        email: 'ahmad.cleaning@example.com',
        password: 'password123',
        phone: '0300-1234567',
        role: 'provider',
        address: 'Lahore',
        profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'Usman Tariq',
        email: 'usman.ac@example.com',
        password: 'password123',
        phone: '0311-9876543',
        role: 'provider',
        address: 'Karachi',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'Bilal Chaudhry',
        email: 'bilal.electric@example.com',
        password: 'password123',
        phone: '0322-5556789',
        role: 'provider',
        address: 'Islamabad',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'Hamza Raza',
        email: 'hamza.plumbing@example.com',
        password: 'password123',
        phone: '0333-1112233',
        role: 'provider',
        address: 'Faisalabad',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'Tariq Mehmood',
        email: 'tariq.pest@example.com',
        password: 'password123',
        phone: '0344-7778899',
        role: 'provider',
        address: 'Multan',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
      },
    ]);

    console.log(`✅ ${providers.length} providers seeded.`);

    // ─── Create services, each linked to its own distinct provider ────────────
    const services = [
      {
        title: 'Deep House Cleaning',
        description: 'Comprehensive top-to-bottom cleaning of your entire home, including bedrooms, bathrooms, living room, and kitchen.',
        category: 'Cleaning',
        price: 3500,
        provider: providers[0]._id,          // Ahmad Khan
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Sofa & Carpet Cleaning',
        description: 'Deep steam cleaning for sofas, carpets, and rugs to remove stains, dust and allergens.',
        category: 'Cleaning',
        price: 2500,
        provider: providers[0]._id,          // Ahmad Khan (same category)
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'AC Servicing & Repair',
        description: 'Expert diagnostics, cleaning, gas refilling, and repair for all split and window air conditioners.',
        category: 'Maintenance',
        price: 1800,
        provider: providers[1]._id,          // Usman Tariq
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Professional Electrician',
        description: 'Fixing switchboards, wiring issues, fan installation, and general electrical maintenance.',
        category: 'Electrical',
        price: 1000,
        provider: providers[2]._id,          // Bilal Chaudhry
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Plumbing Services',
        description: 'Expert plumbing services including pipe repairs, leak fixing, bathroom fittings, and drain cleaning.',
        category: 'Plumbing',
        price: 1200,
        provider: providers[3]._id,          // Hamza Raza
        image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Pest Control',
        description: 'Professional pest control services for cockroaches, termites, bed bugs, mosquitoes and other pests.',
        category: 'Pest Control',
        price: 2000,
        provider: providers[4]._id,          // Tariq Mehmood
        image: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&q=80&w=800'
      }
    ];

    await Service.insertMany(services);
    console.log(`✅ ${services.length} services seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
