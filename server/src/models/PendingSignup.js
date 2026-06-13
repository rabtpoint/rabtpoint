import mongoose from 'mongoose';

const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    signupData: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      photo: { type: String, default: '' },
      country: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      legalConsent: {
        termsAccepted: { type: Boolean, default: false },
        privacyAccepted: { type: Boolean, default: false },
        cookiesAccepted: { type: Boolean, default: false },
        version: { type: String, default: '' }
      }
    },
    expiresAt: { type: Date, required: true, expires: 0 }
  },
  { timestamps: true }
);

export const PendingSignup = mongoose.model('PendingSignup', pendingSignupSchema);
