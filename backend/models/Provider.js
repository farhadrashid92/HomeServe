import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  servicesOffered: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
