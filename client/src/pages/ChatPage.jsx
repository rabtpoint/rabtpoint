import { useEffect, useMemo, useState } from 'react';
import Avatar from '../components/Avatar';
import { IconFilter, IconPlus, IconSend } from '../components/NavIcons';
import { fallbackUsers } from '../data/demo';
import { api } from '../services/api';

const formatTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '9:41 AM';
  if (hour < 17) return '2:15 PM';
  return '6:30 PM';
};

export default function ChatPage({ currentUser }) {
  const [users, setUsers] = useState(fallbackUsers);
  const [receiverId, setReceiverId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const receiver = useMemo(
    () => users.find((user) => user.id === receiverId || user._id === receiverId) || null,
    [receiverId, users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => user.name?.toLowerCase().includes(query));
  }, [search, users]);

  const onlineUsers = users.slice(0, 5);
  const suggestedUsers = users.slice(0, 4);

  useEffect(() => {
    api('/users')
      .then((data) => {
        const other = data.users.filter((user) => user.id !== currentUser?.id);
        setUsers(other.length ? other : fallbackUsers);
        if (other[0]) setReceiverId(other[0].id || other[0]._id);
      })
      .catch(() => setReceiverId(fallbackUsers[0].id));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!receiver?.id || String(receiver.id).startsWith('demo')) {
      setMessages([
        { _id: 'm1', sender: receiver || fallbackUsers[0], text: 'Hey! Welcome to RabtPoint chat.' },
        { _id: 'm2', sender: currentUser, text: 'Thanks! Glad to connect.' }
      ]);
      return;
    }

    api(`/messages/${receiver.id}`)
      .then((data) => setMessages(data.messages.length ? data.messages : []))
      .catch(() => setMessages([]));
  }, [receiver?.id, currentUser, receiver]);

  const pickUser = (user) => {
    setReceiverId(user.id || user._id);
    setMobileShowChat(true);
  };

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim() || !receiver) return;

    if (receiver?.id?.startsWith?.('demo')) {
      setMessages((current) => [...current, { _id: crypto.randomUUID(), sender: currentUser, text }]);
      setText('');
      return;
    }

    const data = await api(`/messages/${receiver.id}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    setMessages((current) => [...current, data.message]);
    setText('');
  };

  return (
    <section className="app-page chat-page neon-chat-page">
      <div className={`chat-shell ${mobileShowChat ? 'show-conversation' : ''}`}>
        <aside className="chat-sidebar neon-panel">
          <div className="chat-sidebar-head">
            <h2>CHAT</h2>
            <button className="neon-gradient-btn small" type="button">
              <IconPlus /> New Chat
            </button>
          </div>

          <div className="neon-search-bar compact">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats..." />
            <button type="button" className="icon-btn" aria-label="Filter">
              <IconFilter />
            </button>
          </div>

          <div className="chat-section">
            <h3 className="section-label">ONLINE NOW</h3>
            <div className="online-row">
              {onlineUsers.map((user) => (
                <button className="online-user" key={user.id || user._id} type="button" onClick={() => pickUser(user)}>
                  <span className="avatar-ring">
                    <Avatar user={user} />
                  </span>
                  <small>{user.name?.split(' ')[0]}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="chat-section">
            <h3 className="section-label">RECENT CHATS</h3>
            <div className="recent-chats">
              {filteredUsers.map((user) => {
                const active = (user.id || user._id) === receiverId;
                return (
                  <button
                    className={`recent-chat-item ${active ? 'active' : ''}`}
                    key={user.id || user._id}
                    type="button"
                    onClick={() => pickUser(user)}
                  >
                    <Avatar user={user} />
                    <span className="recent-chat-body">
                      <strong>{user.name}</strong>
                      <small>{active ? 'Active now' : 'Tap to open chat'}</small>
                    </span>
                    <span className="recent-chat-meta">
                      <small>{formatTime()}</small>
                      {active && <span className="unread-badge">2</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="chat-section">
            <h3 className="section-label">SUGGESTED PEOPLE</h3>
            <div className="suggested-row">
              {suggestedUsers.map((user) => (
                <button className="suggested-person" key={`s-${user.id || user._id}`} type="button" onClick={() => pickUser(user)}>
                  <div className="hex-frame sm">
                    <Avatar user={user} />
                  </div>
                  <strong>{user.name?.split(' ')[0]}</strong>
                  <small>{user.location?.district || user.location?.country}</small>
                  <span className="add-chip">+</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="chat-main neon-panel">
          {!receiver ? (
            <div className="chat-welcome">
              <div className="welcome-icon">
                <IconSend />
              </div>
              <h2>Welcome to Chat</h2>
              <p className="muted">Select a conversation from the list or start a new chat.</p>
              <div className="welcome-features">
                <article>
                  <strong>Connect</strong>
                  <p>Find and connect with people around you.</p>
                </article>
                <article>
                  <strong>Chat</strong>
                  <p>Send messages and share moments.</p>
                </article>
                <article>
                  <strong>Secure</strong>
                  <p>Your privacy and security is our priority.</p>
                </article>
              </div>
            </div>
          ) : (
            <>
              <header className="chat-convo-head">
                <button className="chat-back mobile-only" type="button" onClick={() => setMobileShowChat(false)}>
                  ←
                </button>
                <Avatar user={receiver} />
                <div>
                  <strong>{receiver.name}</strong>
                  <small className="online-dot">Online</small>
                </div>
              </header>

              <div className="messages neon-messages">
                {messages.map((message) => {
                  const mine = (message.sender?.id || message.sender?._id) === currentUser?.id;
                  return (
                    <div className={`message neon-bubble ${mine ? 'mine' : ''}`} key={message._id}>
                      <p>{message.text}</p>
                      {mine && <small className="read-tick">✓✓</small>}
                    </div>
                  );
                })}
              </div>

              <form className="neon-message-form" onSubmit={send}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
                <button className="neon-send-btn" type="submit" aria-label="Send">
                  <IconSend />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
