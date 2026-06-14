import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Reel } from '../models/Reel.js';
import { getBlockedUserIds } from '../utils/blocks.js';
import { countryDisplayLabel, countryMatchRegex, normalizeCountry } from '../utils/trendCountry.js';
import { sortByTrendScore } from '../utils/trendScore.js';
import { toPublicUser } from '../utils/userPublic.js';

const router = express.Router();

const buildTrenders = (reels = []) => {
  const byAuthor = new Map();

  reels.forEach((reel) => {
    const authorId = String(reel.author?._id || reel.author?.id || reel.author);
    if (!authorId || !reel.author || typeof reel.author === 'string') return;

    const current = byAuthor.get(authorId) || {
      author: reel.author,
      totalViews: 0,
      totalLikes: 0,
      reelCount: 0,
      topReel: null
    };

    current.totalViews += reel.views || 0;
    current.totalLikes += reel.likes || 0;
    current.reelCount += 1;

    if (!current.topReel || (reel.views || 0) > (current.topReel.views || 0)) {
      current.topReel = reel;
    }

    byAuthor.set(authorId, current);
  });

  return [...byAuthor.values()]
    .sort((a, b) => b.totalViews - a.totalViews || b.totalLikes - a.totalLikes)
    .slice(0, 10)
    .map((item) => ({
      ...toPublicUser(item.author),
      totalViews: item.totalViews,
      totalLikes: item.totalLikes,
      reelCount: item.reelCount,
      viralReel: item.topReel
        ? {
            _id: item.topReel._id,
            videoUrl: item.topReel.videoUrl,
            caption: item.topReel.caption,
            views: item.topReel.views,
            likes: item.topReel.likes,
            shares: item.topReel.shares
          }
        : null
    }));
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const fallbackCountry = req.user.location?.country || 'United Kingdom';
    const country = normalizeCountry(req.query.country || '', fallbackCountry);
    const blockedIds = await getBlockedUserIds(req.user._id);
    const countryRegex = countryMatchRegex(country);

    const reels = await Reel.find({
      ...(blockedIds.length ? { author: { $nin: blockedIds } } : {}),
      country: countryRegex
    })
      .populate('author')
      .limit(200);

    const ranked = sortByTrendScore(reels).slice(0, 50).map((reel) => ({
      ...reel.toObject(),
      trendScore: undefined,
      author: reel.author ? toPublicUser(reel.author, { viewerId: req.user._id }) : reel.author,
      liked: reel.likedBy?.some((id) => String(id) === String(req.user._id))
    }));

    res.json({
      country,
      countryLabel: countryDisplayLabel(country),
      reels: ranked,
      trenders: buildTrenders(reels)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
