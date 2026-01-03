// In Backend/models/messageModel.js
import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Ride',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    senderName: {
      type: String,
      required: true,
    },
    
    // --- UPDATE THESE FIELDS ---
    originalContent: { // Renamed from 'content'
      type: String,
      required: true,
    },
    sourceLanguage: { // Added
      type: String,
      required: true,
      default: 'en',
    },
    englishContent: { // Added
      type: String,
      required: true,
    },
    // --- END UPDATE ---
  },
  {
    timestamps: true,
  }
);

// Remove the old 'timestamp' field, as 'timestamps: true' handles it
const Message = mongoose.model('Message', messageSchema);
export default Message;