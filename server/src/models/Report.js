import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'post'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
