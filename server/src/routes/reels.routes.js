import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Reel } from '../models/Reel.js';
import { ReelView } from '../models/ReelView.js';
import { toPublicUser } from '../utils/userPublic.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { videoUrl, caption = '', durationSec = 0 } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Video URL is required.' });
    }

    if (Number(durationSec) > 240) {
      return res.status(400).json({ message: 'Reels must be 240 seconds or less.' });
    }

    const reel = await Reel.create({
      author: req.user._id,
      videoUrl,
      caption: String(caption).trim().slice(0, 280),
      country: req.user.location?.country || 'United Kingdom',
      durationSec: Number(durationSec) || 0
    });

    const populated = await reel.populate('author');

    res.status(201).json({
      reel: {
        ...populated.toObject(),
        author: toPublicUser(populated.author, { viewerId: req.user._id }),
        liked: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/view', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await ReelView.findOne({
      reel: reel._id,
      viewer: req.user._id,
      viewedAt: { $gte: since }
    });

    if (!existing) {
      await ReelView.findOneAndUpdate(
        { reel: reel._id, viewer: req.user._id },
        { viewedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      reel.views += 1;
      await reel.save();
    }

    res.json({ views: reel.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    const userId = req.user._id;
    const alreadyLiked = reel.likedBy.some((id) => String(id) === String(userId));

    if (alreadyLiked) {
      reel.likedBy = reel.likedBy.filter((id) => String(id) !== String(userId));
      reel.likes = Math.max(0, reel.likes - 1);
    } else {
      reel.likedBy.push(userId);
      reel.likes += 1;
    }

    await reel.save();
    res.json({ likes: reel.likes, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    reel.shares += 1;
    await reel.save();
    res.json({ shares: reel.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
