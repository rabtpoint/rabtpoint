import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBlockedUserIds } from '../utils/blocks.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { name = '', country = '', district = '' } = req.query;
  const filters = [];
  const blockedIds = await getBlockedUserIds(req.user._id);

  if (blockedIds.length) {
    filters.push({ _id: { $nin: blockedIds } });
  }

  if (name) filters.push({ name: new RegExp(name, 'i') });
  if (country) filters.push({ 'location.country': new RegExp(country, 'i') });
  if (district) filters.push({ 'location.district': new RegExp(district, 'i') });

  const users = await User.find(filters.length ? { $and: filters } : {})
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ users: users.map((user) => user.toPublicJSON(req.user._id)) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const blockedIds = await getBlockedUserIds(req.user._id);

  if (blockedIds.includes(String(req.params.id))) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: user.toPublicJSON(req.user._id) });
});

export default router;
