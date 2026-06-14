export const computeTrendScore = (reel) => {
  const views = reel.views || 0;
  const likes = reel.likes || 0;
  const shares = reel.shares || 0;
  const createdAt = reel.createdAt ? new Date(reel.createdAt) : new Date();
  const hoursSincePosted = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 48 - hoursSincePosted) * 2;

  let score = views + likes * 3 + shares * 5 + recencyBoost;

  if (hoursSincePosted < 6 && views > 10) {
    score *= 1.2;
  }

  if (views > 0) {
    const engagement = ((likes + shares) / views) * 50;
    score += Math.min(20, engagement);
  }

  return score;
};

export const sortByTrendScore = (reels = []) =>
  [...reels].sort((a, b) => computeTrendScore(b) - computeTrendScore(a));
