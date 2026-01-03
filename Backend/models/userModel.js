import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // <--- CHANGED: Set to false
    },
    // --- ADD THIS ---
    googleId: {
      type: String,
    },
    // ----------------
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'bn', 'or', 'es'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password only if it exists and is modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // Handle case where user has no password (Google only account)
  if (!this.password) return false; 
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ currentLocation: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;