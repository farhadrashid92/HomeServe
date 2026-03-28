import User from '../models/User.js';

// Retrieve the active Public Key exposing it to the Vite Service Worker
export const getVapidKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// Bind the Device Endpoint mapping actively against the verified JWT User payload
export const subscribeUser = async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription payload.' });
    }

    const maxSubscriptions = 5; // Cap maximum OS endpoints protecting DB bloating

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    // Check if the specific browser endpoint already exists
    const existingIndex = user.pushSubscriptions?.findIndex(s => s.endpoint === subscription.endpoint);
    
    if (existingIndex > -1) {
        // Update existing keys just in case the browser rotated them
        user.pushSubscriptions[existingIndex] = subscription;
    } else {
        // Push brand new subscription
        if (!user.pushSubscriptions) user.pushSubscriptions = [];
        user.pushSubscriptions.push(subscription);
        // Prune oldest if over cap
        if (user.pushSubscriptions.length > maxSubscriptions) {
            user.pushSubscriptions.shift();
        }
    }

    await user.save();
    res.status(200).json({ message: 'Push Subscription activated successfully.' });
  } catch (error) {
    console.error('Subscription Registration Error:', error);
    res.status(500).json({ message: 'Server error processing subscription payload.' });
  }
};

// Explicitly detach and drop the specified Subscription string breaking ties completely
export const unsubscribeUser = async (req, res) => {
  try {
    const { endpoint } = req.body;
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { pushSubscriptions: { endpoint: endpoint } } }
    );
    res.status(200).json({ message: 'Subscription dropped cleanly.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error dropping subscription.' });
  }
};
