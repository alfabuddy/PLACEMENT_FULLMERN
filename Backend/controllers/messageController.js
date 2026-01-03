// Replace your getRideMessages function with this
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import { translate } from '../utils/translationService.js'; // <-- Import your new service

// @desc    Get all messages for a specific ride, translated for the user
// @route   GET /api/rides/:rideId/messages
// @access  Private
export const getRideMessages = async (req, res) => {
  try {
    // 1. Get the requesting user's preferred language
    const user = await User.findById(req.user._id).select('preferredLanguage');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const targetLang = user.preferredLanguage || 'en';

    // 2. Get all messages for the ride from the database
    const messages = await Message.find({ ride: req.params.rideId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name'); // Populate sender info

    // 3. Translate the history on-the-fly
    const translatedHistory = await Promise.all(
      messages.map(async (msg) => {
        let translatedMessage = msg.englishContent; // Start with the English version

        // If target lang isn't English, translate from English to target
        if (targetLang !== 'en') {
          const result = await translate(msg.englishContent, 'en', targetLang);
          translatedMessage = result.translatedContent;
        }
        
        // If target lang is the *same* as the source, just use the original
        if (targetLang === msg.sourceLanguage) {
          translatedMessage = msg.originalContent;
        }
        
        return {
          _id: msg._id,
          rideId: msg.ride,
          authorId: msg.sender._id, // <-- Send authorId
          author: msg.sender.name, // <-- Use populated name
          originalMessage: msg.originalContent,
          translatedMessage: translatedMessage,
          sourceLanguage: msg.sourceLanguage,
          time: new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );

    res.json(translatedHistory);

  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Server error loading messages." });
  }
};