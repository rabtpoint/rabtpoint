import Avatar from './Avatar';
import { IconBookmark, IconComment, IconHeart, IconShare } from './NavIcons';

export default function PostCard({ post, onProfile }) {
  return (
    <article className="neon-post-card">
      <button className="neon-post-header" type="button" onClick={() => onProfile?.(post.author)}>
        <Avatar user={post.author} />
        <span className="neon-post-meta">
          <strong>{post.author?.name}</strong>
          <small>
            {post.place || post.author?.location?.district} · {post.timeAgo || 'Recently'}
          </small>
        </span>
      </button>
      {post.image && <img className="neon-post-image" src={post.image} alt="" />}
      <p className="neon-post-text">{post.text}</p>
      <div className="neon-post-actions">
        <button type="button" className="neon-action-btn">
          <IconHeart /> {post.likes || 0}
        </button>
        <button type="button" className="neon-action-btn">
          <IconComment /> Comment
        </button>
        <button type="button" className="neon-action-btn">
          <IconShare /> Share
        </button>
        <button type="button" className="neon-action-btn neon-action-save">
          <IconBookmark />
        </button>
      </div>
    </article>
  );
}
