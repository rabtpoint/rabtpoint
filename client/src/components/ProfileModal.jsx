import { useState } from 'react';
import Avatar from './Avatar';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function ProfileModal({ user, onClose, postId = null }) {
  const { user: currentUser } = useApp();
  const [reason, setReason] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const isSelf = currentUser?.id === user.id;

  const blockUser = async () => {
    try {
      await api(`/safety/block/${user.id}`, { method: 'POST' });
      setInfo('User blocked.');
    } catch (err) {
      setError(err.message);
    }
  };

  const reportTarget = async (targetType) => {
    if (!reason.trim()) {
      setError('Report reason likho.');
      return;
    }

    try {
      await api('/safety/report', {
        method: 'POST',
        body: JSON.stringify({
          targetType,
          targetId: targetType === 'post' ? postId : user.id,
          reason
        })
      });
      setInfo('Report submit ho gaya.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose}>
          x
        </button>
        <Avatar user={user} size="lg" />
        <h2>{user.name}</h2>
        {user.username && <p className="muted">@{user.username}</p>}
        <p>{user.bio || 'RabtPoint user'}</p>
        <div className="profile-grid">
          <span>Country</span>
          <strong>{user.location?.country}</strong>
          <span>State</span>
          <strong>{user.location?.state || '-'}</strong>
          <span>District</span>
          <strong>{user.location?.district || '-'}</strong>
          <span>City</span>
          <strong>{user.location?.city || '-'}</strong>
          <span>Latitude</span>
          <strong>{user.location?.latitude ?? '-'}</strong>
          <span>Longitude</span>
          <strong>{user.location?.longitude ?? '-'}</strong>
        </div>

        {!isSelf && (
          <div className="auth-form profile-actions">
            <input placeholder="Report reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <button className="secondary-button" type="button" onClick={() => reportTarget('user')}>
              Report user
            </button>
            {postId && (
              <button className="secondary-button" type="button" onClick={() => reportTarget('post')}>
                Report post
              </button>
            )}
            <button className="secondary-button" type="button" onClick={blockUser}>
              Block user
            </button>
          </div>
        )}

        {info && <p className="info-text">{info}</p>}
        {error && <p className="error-text">{error}</p>}
      </article>
    </div>
  );
}
