import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Block } from '../models/Block.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { writeAudit } from '../utils/audit.js';
import { toPublicUser } from '../utils/userPublic.js';

const router = express.Router();

router.get('/blocked', requireAuth, async (req, res) => {
  const rows = await Block.find({ blocker: req.user._id }).populate('blocked');
  res.json({ users: rows.map((row) => toPublicUser(row.blocked, { viewerId: req.user._id })) });
});

router.post('/block/:userId', requireAuth, async (req, res) => {
  const blockedId = req.params.userId;

  if (String(blockedId) === String(req.user._id)) {
    return res.status(400).json({ message: 'Aap khud ko block nahi kar sakte.' });
  }

  const target = await User.findById(blockedId);
  if (!target) return res.status(404).json({ message: 'User not found' });

  await Block.findOneAndUpdate(
    { blocker: req.user._id, blocked: blockedId },
    { blocker: req.user._id, blocked: blockedId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await writeAudit({ actorId: req.user._id, action: 'user_blocked', targetType: 'user', targetId: blockedId });
  res.json({ message: 'User blocked' });
});

router.delete('/block/:userId', requireAuth, async (req, res) => {
  await Block.deleteOne({ blocker: req.user._id, blocked: req.params.userId });
  res.json({ message: 'User unblocked' });
});

router.post('/report', requireAuth, async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!['user', 'post'].includes(targetType) || !targetId || !reason) {
    return res.status(400).json({ message: 'targetType, targetId aur reason required hai.' });
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason: String(reason).trim()
  });

  await writeAudit({
    actorId: req.user._id,
    action: 'report_created',
    targetType,
    targetId,
    meta: { reportId: report._id }
  });

  res.status(201).json({ message: 'Report submit ho gaya.', report });
});

export default router;
