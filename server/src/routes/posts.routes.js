import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBlockedUserIds } from '../utils/blocks.js';
import { Post } from '../models/Post.js';
import { toPublicUser } from '../utils/userPublic.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const blockedIds = await getBlockedUserIds(req.user._id);
  const posts = await Post.find(blockedIds.length ? { author: { $nin: blockedIds } } : {})
    .populate('author')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    posts: posts.map((post) => ({
      ...post.toObject(),
      author: post.author ? toPublicUser(post.author, { viewerId: req.user._id }) : post.author
    }))
  });
});

router.post('/', requireAuth, async (req, res) => {
  const { text, image, place } = req.body;
  if (!text) return res.status(400).json({ message: 'Post text is required' });

  const post = await Post.create({ author: req.user._id, text, image, place });
  const populated = await post.populate('author');

  res.status(201).json({
    post: {
      ...populated.toObject(),
      author: toPublicUser(populated.author, { viewerId: req.user._id })
    }
  });
});

export default router;
