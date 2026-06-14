import mongoose from 'mongoose';

const reelViewSchema = new mongoose.Schema(
  {
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true, index: true },
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    viewedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

reelViewSchema.index({ reel: 1, viewer: 1 }, { unique: true });

export const ReelView = mongoose.model('ReelView', reelViewSchema);
