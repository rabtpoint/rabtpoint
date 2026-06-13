import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { IconFilter, IconPlus } from '../components/NavIcons';
import { fallbackPosts, trendingStories } from '../data/demo';
import { api, uploadImage } from '../services/api';

export default function FeedPage({ onProfile }) {
  const [posts, setPosts] = useState(fallbackPosts);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('Trending in London');

  useEffect(() => {
    api('/posts')
      .then((data) => setPosts(data.posts.length ? data.posts : fallbackPosts))
      .catch(() => setPosts(fallbackPosts));
  }, []);

  const uploadPostImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setUploadingPostImage(true);
    try {
      const data = await uploadImage(file);
      setPostImage(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPostImage(false);
    }
  };

  const createPost = async (event) => {
    event.preventDefault();
    if (!newPost.trim()) return;
    const data = await api('/posts', {
      method: 'POST',
      body: JSON.stringify({ text: newPost, image: postImage, place: 'Current city' })
    });
    setPosts((current) => [data.post, ...current]);
    setNewPost('');
    setPostImage('');
  };

  return (
    <section className="app-page discover-page">
      <div className="discover-top">
        <div className="neon-search-bar">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Trending in London" />
          <button type="button" className="icon-btn" aria-label="Filter">
            <IconFilter />
          </button>
        </div>
      </div>

      <div className="trenders-section">
        <h2 className="section-label">TRENDERS</h2>
        <div className="trenders-row">
          {trendingStories.map((story) => (
            <div className="trender-card" key={story}>
              <div className="hex-frame">
                <span className="hex-initial">{story[0]}</span>
              </div>
              <strong>{story.split(' ').slice(-1)[0]}</strong>
              <small>{story}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="discover-feed">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onProfile={onProfile} />
        ))}
      </div>

      <form className="neon-fab-form" onSubmit={createPost}>
        <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share something..." />
        <label className="neon-upload-btn">
          {uploadingPostImage ? '...' : postImage ? '✓' : '+'}
          <input accept="image/*" type="file" onChange={uploadPostImage} />
        </label>
        <button className="neon-fab" type="submit" aria-label="Post">
          <IconPlus />
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </section>
  );
}
