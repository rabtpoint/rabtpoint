import { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { fallbackPosts, fallbackUsers } from '../data/demo';
import { api } from '../services/api';

export default function FriendsPage({ onProfile, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState(fallbackUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/posts').catch(() => ({ posts: fallbackPosts })),
      api('/users').catch(() => ({ users: fallbackUsers }))
    ]).then(([postData, userData]) => {
      const allUsers = userData.users?.length ? userData.users : fallbackUsers;
      const allPosts = postData.posts?.length ? postData.posts : fallbackPosts;
      const me = currentUser?.id;

      const friends = allUsers.filter((user) => user.id !== me && user._id !== me);
      const friendIds = new Set(friends.map((user) => user.id || user._id));

      const friendPosts = allPosts.filter((post) => {
        const authorId = post.author?.id || post.author?._id;
        return friendIds.has(authorId);
      });

      setUsers(friends);
      setPosts(friendPosts.length ? friendPosts : allPosts.slice(0, 6));
      setLoading(false);
    });
  }, [currentUser?.id]);

  const friendCount = users.length;

  return (
    <section className="app-page friends-page">
      <header className="neon-page-header">
        <div>
          <p className="section-label">FRIENDS</p>
          <h1>Friends Feed</h1>
          <p className="muted">Posts from people you connect with on RabtPoint.</p>
        </div>
        <div className="neon-stat-pill">{friendCount} friends</div>
      </header>

      <div className="friends-strip">
        {users.slice(0, 8).map((user) => (
          <button className="friend-chip" key={user.id || user._id} type="button" onClick={() => onProfile(user)}>
            <Avatar user={user} />
            <span>{user.name?.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted center-text">Loading friends posts...</p>
      ) : posts.length === 0 ? (
        <div className="neon-empty-card">
          <h2>No friend posts yet</h2>
          <p className="muted">Chat with people or search nearby users to grow your friends feed.</p>
        </div>
      ) : (
        <div className="discover-feed">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onProfile={onProfile} />
          ))}
        </div>
      )}
    </section>
  );
}
