import mongoose from 'mongoose';

const authOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, required: true, enum: ['login', 'forgot-password', 'change-email'] },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    resetTokenHash: { type: String, default: '' },
    resetTokenExpiresAt: { type: Date, default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    expiresAt: { type: Date, required: true, expires: 0 }
  },
  { timestamps: true }
);

authOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const AuthOtp = mongoose.model('AuthOtp', authOtpSchema);
