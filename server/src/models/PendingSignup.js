import mongoose from 'mongoose';

const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    signupData: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      photo: { type: String, default: '' },
      country: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    expiresAt: { type: Date, required: true, expires: 0 }
  },
  { timestamps: true }
);

export const PendingSignup = mongoose.model('PendingSignup', pendingSignupSchema);
