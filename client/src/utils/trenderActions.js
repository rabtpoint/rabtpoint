export const trenderLocationLabel = (trender = {}) => {
  const district = trender.location?.district;
  const country = trender.location?.country;

  if (district && country) {
    const short = country === 'United Kingdom' ? 'UK' : country === 'United States' ? 'USA' : country;
    return `${district}, ${short}`;
  }

  return country || '';
};

export const findViralReel = (trender, reels = []) => {
  if (trender?.viralReel?._id) {
    const match = reels.find((reel) => String(reel._id) === String(trender.viralReel._id));
    return match || { ...trender.viralReel, author: trender };
  }

  const authorId = String(trender.id || trender._id || '');
  if (!authorId) return null;

  const authorReels = reels.filter((reel) => String(reel.author?.id || reel.author?._id) === authorId);
  if (!authorReels.length) return null;

  return authorReels.reduce((best, reel) => ((reel.views || 0) > (best?.views || 0) ? reel : best), null);
};

export const openTrender = (trender, { reels = [], onOpenReel, onProfile }) => {
  const viralReel = findViralReel(trender, reels);
  if (viralReel) {
    onOpenReel?.(viralReel);
    return;
  }

  onProfile?.(trender);
};
