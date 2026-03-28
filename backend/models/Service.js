import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Cleaning', 
      'Maintenance', 
      'Electrical', 
      'Plumbing', 
      'Pest Control', 
      'Painting', 
      'Carpenter', 
      'CCTV Installation', 
      'Gardening', 
      'Home Shifting'
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  providers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  rating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
