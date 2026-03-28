import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  profileImage: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  },
  address: {
    type: String,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
  },
  availability: {
    type: Map,
    of: [String],
    default: {
      "Monday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Tuesday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Wednesday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Thursday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Friday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Saturday": ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
      "Sunday": []
    }
  },
  pushSubscriptions: [
    {
      endpoint: String,
      expirationTime: Number,
      keys: {
        p256dh: String,
        auth: String
      }
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
