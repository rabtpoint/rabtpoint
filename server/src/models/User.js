import mongoose from 'mongoose';
import { toPublicUser } from '../utils/userPublic.js';

const locationSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  { _id: false }
);

const legalConsentSchema = new mongoose.Schema(
  {
    termsAccepted: { type: Boolean, default: false },
    privacyAccepted: { type: Boolean, default: false },
    cookiesAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date, default: null },
    version: { type: String, default: '' }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    photo: { type: String, default: '' },
    location: { type: locationSchema, required: true },
    bio: { type: String, default: 'RabtPoint user' },
    emailVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    privacy: {
      locationVisibility: { type: String, enum: ['exact', 'district', 'hidden'], default: 'district' }
    },
    legalConsent: { type: legalConsentSchema, default: () => ({}) },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: '' },
    lastLoginUserAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', 'location.country': 'text', 'location.state': 'text', 'location.district': 'text', 'location.city': 'text' });

userSchema.methods.toPublicJSON = function (viewerId) {
  return toPublicUser(this, { viewerId });
};

export const User = mongoose.model('User', userSchema);

export const syncAdminFlag = (user) => {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (admins.includes(user.email)) {
    user.isAdmin = true;
  }

  return user;
};
