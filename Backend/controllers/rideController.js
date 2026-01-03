import Ride from '../models/rideModel.js';
import User from '../models/userModel.js'; // Make sure User model is imported

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
  // --- UPDATED: Destructure new fields from req.body ---
  const { from, to, date, time, seats, cost, startLat, startLng } = req.body;

  // Combine date and time into a single JavaScript Date object
  const startTime = new Date(`${date}T${time}`);

  // --- UPDATED LOGIC ---
  // Default coordinates
  let startCoordinates = [0, 0]; 
  
  // If lat and lng are provided, use them.
  // Remember: GeoJSON expects [longitude, latitude]
  if (startLat && startLng) {
    startCoordinates = [parseFloat(startLng), parseFloat(startLat)];
  }

  // We'll keep endLocation as default [0,0] for now,
  // as we only added location capture for the 'from' field.
  let endCoordinates = [0, 0];
  // --- END UPDATED LOGIC ---


  const ride = new Ride({
    creator: req.user._id,
    participants: [req.user._id],
    
    startLocation: {
      type: 'Point',
      coordinates: startCoordinates, // <-- USE THE NEW COORDINATES
      address: from,
    },
    endLocation: {
      type: 'Point',
      coordinates: endCoordinates, // <-- USE DEFAULT COORDINATES
      address: to,
    },
    
    startTime: startTime,
    maxCapacity: Number(seats),
    totalFare: Number(cost),
  });

  try {
    const createdRide = await ride.save();
    res.status(201).json(createdRide);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating ride. ' + error.message });
  }
};

// @desc    Get all pending rides (for Dashboard)
// @route   GET /api/rides
// @access  Private
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({ 
      status: 'pending',
      // Find rides that are in the future
      startTime: { $gt: new Date() } 
    })
    .populate('creator', 'name') // Get the creator's name
    .populate('participants', 'name') // <-- ADD THIS LINE
    .sort({ startTime: 1 });  // Show the soonest rides first

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Find nearby pending rides
// @route   GET /api/rides/nearby
// @access  Private
const getNearbyRides = async (req, res) => {
  const { lat, lng } = req.query;
  const maxDistance = 5000; // 5 kilometers

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const rides = await Ride.find({
      startLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: maxDistance,
        },
      },
      status: 'pending',
      // Ensure user is not already a participant and not the creator
      creator: { $ne: req.user._id },
      participants: { $nin: [req.user._id] }
    }).populate('creator', 'name'); // Populate creator's name

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching rides' });
  }
};

// @desc    Join a ride
// @route   POST /api/rides/:id/join
// @access  Private
const joinRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      // --- FIX: Corrected status code 4404 to 404 ---
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is not available to join' });
    }

    if (ride.participants.length >= ride.maxCapacity) {
      return res.status(400).json({ message: 'Ride is full' });
    }
    
    // --- FIX: Changed .includes() to a reliable string comparison ---
    const isAlreadyParticipant = ride.participants.some(
      (pId) => pId.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ message: 'You are already in this ride' });
    }
    // --- END FIX ---

    ride.participants.push(req.user._id);
    await ride.save();

    res.json({ message: 'Successfully joined ride' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all rides a user is in (for a "My Rides" page)
// @route   GET /api/rides/myrides
// @access  Private
const getMyRides = async (req, res) => {
    try {
        const rides = await Ride.find({ 
            participants: req.user._id 
        })
        .populate('creator', 'name')
        .populate('participants', 'name');

        res.json(rides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Authorization: Check if the user is the creator or a participant
    const isCreator = ride.creator.toString() === req.user._id.toString();
    const isParticipant = ride.participants.some(pId => pId.toString() === req.user._id.toString());

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Update status if it's currently pending or active
    if (ride.status === 'pending' || ride.status === 'active') {
       ride.status = 'completed';
       await ride.save();
       res.json({ message: 'Ride marked as completed', ride });
    } else {
       // Ride might already be completed or cancelled
       res.status(400).json({ message: `Ride status is already ${ride.status}` });
    }

  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all participant locations for a specific ride
// @route   GET /api/rides/:rideId/locations
// @access  Private
const getRideLocations = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId).select('participants');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the requesting user is part of this ride
    const isParticipant = ride.participants.some(pId => pId.equals(req.user._id));
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this ride' });
    }

    // Find all users in the participants list
    // We select only the name and their currentLocation
    const participants = await User.find({
      _id: { $in: ride.participants },
    }).select('name currentLocation');

    // Format the data for the frontend
    const locations = participants.map(p => ({
      userId: p._id,
      userName: p.name,
      // Note: Mongoose stores as [lng, lat]
      location: { 
        lat: p.currentLocation.coordinates[1], 
        lng: p.currentLocation.coordinates[0] 
      }
    }));

    res.json(locations);

  } catch (error) {
    console.error("Error fetching ride locations:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Make sure to export ALL functions
export { 
  createRide, // <-- This one was updated
  getAllRides, 
  getNearbyRides, 
  joinRide, 
  getMyRides,
  completeRide,
  getRideLocations 
};