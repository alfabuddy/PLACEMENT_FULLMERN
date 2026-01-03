// routes/rideRoutes.js
import express from 'express';
const router = express.Router(); // Create a new router instance for rides

import {
  createRide,
  getAllRides,
  getNearbyRides,
  joinRide,
  getMyRides,
  completeRide,
  getRideLocations // <-- IMPORT NEW FUNCTION
} from '../controllers/rideController.js';
import { getRideMessages } from '../controllers/messageController.js';

import { protect } from '../middleware/authMiddleware.js'; // Import the protect middleware

// Apply the 'protect' middleware to ALL ride routes defined below this line
router.use(protect);

// Define the routes on the new router instance
router.route('/')
  .get(getAllRides)
  .post(createRide);

router.route('/nearby').get(getNearbyRides);
router.route('/myrides').get(getMyRides);

// --- ADD THIS ROUTE ---
router.route('/:rideId/locations').get(getRideLocations);
// --- END ADD ---

router.route('/:id/join').post(joinRide);
router.route('/:rideId/messages').get(getRideMessages);
router.route('/:id/complete').patch(completeRide);

export default router; // Export the ride-specific router