import Message from '../models/Message.js';
import mongoose from 'mongoose';

// Send a basic chat string bridging two user architectures
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver and content fields are strictly required." });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve a chronologically grouped mapping of all active Fiverr-style chat threads
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Aggressive grouping pipeline pulling the other person's exact User Document Profile organically
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 } // Read chronologically downward matching WhatsApp standards
      },
      {
        $group: {
          _id: {
            $cond: [ { $eq: ["$sender", userId] }, "$receiver", "$sender" ]
          },
          lastMessage: { $first: "$content" },
          createdAt: { $first: "$createdAt" },
          unreadCount: { 
            // Mathematically loop unread counts specifically hitting my receiver inbox
            $sum: { 
              $cond: [ { $and: [ { $eq: ["$receiver", userId] }, { $eq: ["$read", false] } ] }, 1, 0 ] 
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1, // Target mapping ID
          'user._id': 1,
          'user.name': 1,
          'user.profileImage': 1,
          'user.email': 1,
          'user.role': 1,
          lastMessage: 1,
          createdAt: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { createdAt: -1 } // Re-sort conversations forcing active ones upwards
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve the direct 1:1 message transcript natively un-flagging unread payloads
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The targeting user we are actively looking at
    const myId = req.user.id;

    // Background passive read-mapping intercepting unread flags on fetch loops
    await Message.updateMany(
      { sender: userId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 }); // Oldest up top matching standard chat interfaces

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pure integer fetch for the global Navbar badge polling
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user.id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
