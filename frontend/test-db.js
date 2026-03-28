import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import Service from './backend/models/Service.js';

dotenv.config({ path: './backend/.env' });

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homeserve');
    console.log('MongoDB Connected');
    
    const latestUser = await User.findOne({ role: 'provider' }).sort({ createdAt: -1 });
    console.log('Latest Provider User:', latestUser);
    
    if (latestUser) {
      const usersService = await Service.find({ provider: latestUser._id });
      console.log(`Services for user ${latestUser._id}:`, usersService);
    }
    
    const latestService = await Service.findOne().sort({ createdAt: -1 }).populate('provider', 'name email').lean();
    console.log('Latest Service Collection Entry:', latestService);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDb();
