import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paymentId: String,
  method: {
    type: String,
    enum: ["online", "cash"],
    required: true,
  },
});

const rideSchema = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    payments: [paymentSchema], // ✅ payment tracking

    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: String,
    },

    endLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },

    startTime: {
      type: Date,
      required: true,
    },

    maxCapacity: {
      type: Number,
      required: true,
      default: 3,
    },

    totalFare: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
rideSchema.index({ startLocation: '2dsphere' });

export default mongoose.model('Ride', rideSchema);
