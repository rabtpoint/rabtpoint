import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoUrl: { type: String, required: true },
    caption: { type: String, default: '', trim: true, maxlength: 280 },
    country: { type: String, required: true, trim: true, index: true },
    durationSec: { type: Number, default: 0, max: 240 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

reelSchema.index({ country: 1, createdAt: -1 });

export const Reel = mongoose.model('Reel', reelSchema);
