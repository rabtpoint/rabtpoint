import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

sessionSchema.methods.toSafeJSON = function (currentSessionId) {
  return {
    id: this._id,
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
    createdAt: this.createdAt,
    lastUsedAt: this.lastUsedAt,
    current: currentSessionId ? String(this._id) === String(currentSessionId) : false
  };
};

export const Session = mongoose.model('Session', sessionSchema);
