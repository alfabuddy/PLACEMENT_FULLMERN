// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js';
import Message from './models/messageModel.js';
import User from './models/userModel.js';
import paymentRoutes from "./routes/paymentRoutes.js";


// Import our new translation service
import { detectLanguage, translate } from './utils/translationService.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <-- IMPORT NEW USER ROUTES

// Connect to Database
connectDB();

const app = express();
// app.use(cors()); 
// Change this:
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Use Env Var
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes); // <-- ADD NEW USER ROUTES
app.use("/api/payment", paymentRoutes);

// --- Socket.io Setup ---
const server = http.createServer(app);
// And update the Socket.io origin as well:
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Maps socket.id to a { userId, rideId }
const socketUserMap = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- UPDATED CHAT JOIN ---
  socket.on('join_ride_chat', (data) => {
    // data = { rideId, userId }
    if (!data.rideId || !data.userId) {
      console.warn(`Attempted to join chat without rideId/userId by ${socket.id}`);
      return;
    }
    socket.join(data.rideId);
    // Store user and ride info for this socket
    socketUserMap[socket.id] = { userId: data.userId, rideId: data.rideId };
    console.log(`Socket ${socket.id} (User ${data.userId}) joined chat for ride ${data.rideId}`);
  });

  // --- UPDATED SEND MESSAGE ---
  socket.on('send_message', async (data) => {
    // data = { rideId, authorId, authorName, message }
    if (!data.rideId || !data.authorId || !data.authorName || !data.message) {
      console.error("Incomplete message data from socket:", socket.id);
      return socket.emit('message_error', { message: "Incomplete message data." });
    }

    try {
      // 1. Detect language of original message
      const sourceLang = await detectLanguage(data.message);
      
      // 2. Translate to English (our "bridge" language)
      const { englishContent } = await translate(data.message, sourceLang, 'en');

      // 3. Save the *original* and *English* version to DB
      const newMessage = new Message({
        ride: data.rideId,
        sender: data.authorId,
        senderName: data.authorName,
        originalContent: data.message,
        sourceLanguage: sourceLang,
        englishContent: englishContent,
      });
      const savedMessage = await newMessage.save();

      // 4. Get all sockets (users) currently in this ride's room
      const socketsInRoom = await io.in(data.rideId).fetchSockets();

      // 5. Loop and send a custom-translated message to each user
      for (const sock of socketsInRoom) {
        const recipientInfo = socketUserMap[sock.id];
        if (!recipientInfo) continue; // Skip if user info not found

        // Get this specific user's language preference
        const recipientUser = await User.findById(recipientInfo.userId).select('preferredLanguage');
        const targetLang = recipientUser ? recipientUser.preferredLanguage : 'en';

        let finalTranslatedContent = englishContent;

        // If their preferred lang isn't English, translate from English to their lang
        if (targetLang !== 'en') {
          const result = await translate(englishContent, 'en', targetLang);
          finalTranslatedContent = result.translatedContent;
        }

        // 6. Prepare the custom data packet for this user
        const broadcastData = {
          _id: savedMessage._id.toString(),
          rideId: savedMessage.ride,
          authorId: savedMessage.sender, // <-- Send authorId
          author: savedMessage.senderName,
          originalMessage: savedMessage.originalContent,
          translatedMessage: finalTranslatedContent, // <-- The custom translation
          sourceLanguage: savedMessage.sourceLanguage,
          time: new Date(savedMessage.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        
        // 7. Emit the custom message *only* to this one socket
        sock.emit('receive_message', broadcastData);
      }

    } catch (error) {
      console.error("Error in send_message pipeline:", error);
      socket.emit('message_error', { message: "Server error: Could not send message." });
    }
  });

  // ... (update_location logic is unchanged) ...
  socket.on('update_location', async (data) => {
    if (!data.rideId || !data.userId || !data.location) {
      console.error("Incomplete location data from socket:", socket.id);
      return socket.emit('location_error', { message: "Incomplete location data." });
    }
    try {
      await User.findByIdAndUpdate(data.userId, {
        currentLocation: {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat]
        }
      });
      io.to(data.rideId).emit('location_updated', {
        userId: data.userId,
        userName: data.userName,
        location: data.location 
      });
    } catch (error) {
      console.error("Error updating/broadcasting location:", error);
      socket.emit('location_error', { message: "Server error updating location." });
    }
  });


  // --- UPDATED DISCONNECT ---
  socket.on('disconnect', (reason) => {
    console.log(`User Disconnected: ${socket.id}, Reason: ${reason}`);
    // Clean up the user map
    delete socketUserMap[socket.id];
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);