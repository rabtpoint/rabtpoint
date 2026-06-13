import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { areUsersBlocked } from '../utils/blocks.js';
import { Message } from '../models/Message.js';

const router = express.Router();

router.get('/:receiverId', requireAuth, async (req, res) => {
  const receiverId = req.params.receiverId;

  if (await areUsersBlocked(req.user._id, receiverId)) {
    return res.status(403).json({ message: 'Blocked user ke saath chat nahi kar sakte.' });
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id }
    ]
  })
    .populate('sender', 'name photo')
    .populate('receiver', 'name photo')
    .sort({ createdAt: 1 });

  res.json({ messages });
});

router.post('/:receiverId', requireAuth, async (req, res) => {
  if (!req.body.text) return res.status(400).json({ message: 'Message text is required' });

  if (await areUsersBlocked(req.user._id, req.params.receiverId)) {
    return res.status(403).json({ message: 'Blocked user ko message nahi bhej sakte.' });
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: req.params.receiverId,
    text: req.body.text
  });

  const populated = await message.populate([
    { path: 'sender', select: 'name photo' },
    { path: 'receiver', select: 'name photo' }
  ]);

  res.status(201).json({ message: populated });
});

export default router;
