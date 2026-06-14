import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { IconHeart, IconShare } from './NavIcons';
import { api } from '../services/api';

export default function ReelCard({ reel, onProfile }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState(reel.likes || 0);
  const [shares, setShares] = useState(reel.shares || 0);
  const [views, setViews] = useState(reel.views || 0);
  const [liked, setLiked] = useState(Boolean(reel.liked));
  const viewedRef = useRef(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.play().catch(() => {});
          if (!viewedRef.current) {
            viewedRef.current = true;
            api(`/reels/${reel._id}/view`, { method: 'POST' })
              .then((data) => setViews(data.views))
              .catch(() => {});
          }
        } else {
          node.pause();
        }
      },
      { threshold: 0.65 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reel._id]);

  const toggleLike = async () => {
    try {
      const data = await api(`/reels/${reel._id}/like`, { method: 'POST' });
      setLikes(data.likes);
      setLiked(data.liked);
    } catch {
      // ignore
    }
  };

  const shareReel = async () => {
    try {
      const data = await api(`/reels/${reel._id}/share`, { method: 'POST' });
      setShares(data.shares);
      if (navigator.share) {
        await navigator.share({ title: 'RabtPoint reel', url: window.location.href });
      }
    } catch {
      // ignore
    }
  };

  return (
    <article className="reel-card">
      <video
        ref={videoRef}
        className="reel-video"
        src={reel.videoUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={() => setMuted((current) => !current)}
      />

      <div className="reel-overlay">
        <button className="reel-author" type="button" onClick={() => onProfile?.(reel.author)}>
          <Avatar user={reel.author} />
          <span>
            <strong>{reel.author?.name}</strong>
            <small>{reel.country}</small>
          </span>
        </button>

        {reel.caption && <p className="reel-caption">{reel.caption}</p>}

        <div className="reel-actions">
          <button type="button" className={`reel-action ${liked ? 'active' : ''}`} onClick={toggleLike}>
            <IconHeart /> {likes}
          </button>
          <button type="button" className="reel-action" onClick={shareReel}>
            <IconShare /> {shares}
          </button>
          <span className="reel-views">{views} views</span>
        </div>
      </div>
    </article>
  );
}
