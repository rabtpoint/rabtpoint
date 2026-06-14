import { useEffect, useState } from 'react';
import { refreshCurrentUser, useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function SettingsPanel({ open: controlledOpen, onClose, initialTab = 'profile', showTrigger = true }) {
  const { user, theme, setTheme, updateUser, logout } = useApp();
  const [internalOpen, setInternalOpen] = useState(false);
  const [tab, setTab] = useState(initialTab);
  const [profile, setProfile] = useState({ username: '', bio: '', locationVisibility: 'exact' });
  const [emailChange, setEmailChange] = useState({ newEmail: '', otp: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [sessions, setSessions] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const open = controlledOpen ?? internalOpen;

  const closePanel = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  useEffect(() => {
    if (controlledOpen) setTab(initialTab);
  }, [controlledOpen, initialTab]);

  useEffect(() => {
    if (!open || !user) return;

    setTab(initialTab);
    setProfile({
      username: user.username || '',
      bio: user.bio || '',
      locationVisibility: user.privacy?.locationVisibility || 'exact'
    });

    Promise.all([loadSessions(), loadBlocked()]).catch((err) => setError(err.message));
  }, [open, user, initialTab]);

  const loadSessions = async () => {
    const data = await api('/auth/sessions');
    setSessions(data.sessions || []);
  };

  const loadBlocked = async () => {
    const data = await api('/safety/blocked');
    setBlocked(data.users || []);
  };

  const openPanel = async (nextTab = 'profile') => {
    setTab(nextTab);
    setInternalOpen(true);
    setError('');
    setInfo('');
  };

  const saveProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/account/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          username: profile.username,
          bio: profile.bio,
          privacy: { locationVisibility: profile.locationVisibility }
        })
      });
      updateUser(data.user);
      setInfo('Profile update ho gaya.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/account/email/change/send-otp', {
        method: 'POST',
        body: JSON.stringify({ newEmail: emailChange.newEmail })
      });
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailChange = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/account/email/change/verify', {
        method: 'POST',
        body: JSON.stringify(emailChange)
      });
      updateUser(data.user);
      setInfo(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rabtpoint-export.json';
      link.click();
      URL.revokeObjectURL(url);
      setInfo('Account data download ho gaya.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword) {
      setError('Delete ke liye password confirm karo.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api('/account', { method: 'DELETE', body: JSON.stringify({ password: deletePassword }) });
      logout();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logoutSession = async (id) => {
    await api(`/auth/sessions/${id}`, { method: 'DELETE' });
    await loadSessions();
    setInfo('Device logout ho gaya.');
  };

  const logoutAll = async () => {
    await api('/auth/sessions/logout-all', { method: 'POST' });
    await loadSessions();
    setInfo('Baaki sab devices logout ho gaye.');
  };

  const unblockUser = async (id) => {
    await api(`/safety/block/${id}`, { method: 'DELETE' });
    await loadBlocked();
    setInfo('User unblocked.');
  };

  if (!user) return null;

  return (
    <>
      {showTrigger && (
        <div className="settings-card desktop-only-settings">
          <span>Settings</span>
          <button className="pill-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </button>
          <button className="secondary-button" type="button" onClick={() => openPanel('profile')}>
            Open
          </button>
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={closePanel}>
          <article className="settings-modal" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button close-button" type="button" onClick={closePanel}>
              x
            </button>
            <h2>Account settings</h2>

            <div className="auth-tabs">
              {['profile', 'security', 'privacy', 'blocked'].map((item) => (
                <button key={item} className={tab === item ? 'active' : ''} type="button" onClick={() => setTab(item)}>
                  {item}
                </button>
              ))}
            </div>

            {info && <p className="info-text">{info}</p>}
            {error && <p className="error-text">{error}</p>}

            {tab === 'profile' && (
              <div className="auth-form">
                <input placeholder="Username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                <input placeholder="Bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                <input placeholder="Email" value={user.email} disabled />
                <input placeholder="New email" value={emailChange.newEmail} onChange={(e) => setEmailChange({ ...emailChange, newEmail: e.target.value })} />
                <button className="secondary-button" type="button" onClick={sendEmailOtp} disabled={loading}>
                  Send email change OTP
                </button>
                <input placeholder="Email change OTP" value={emailChange.otp} onChange={(e) => setEmailChange({ ...emailChange, otp: e.target.value })} />
                <button className="secondary-button" type="button" onClick={verifyEmailChange} disabled={loading}>
                  Verify new email
                </button>
                <button className="primary-button" type="button" onClick={saveProfile} disabled={loading}>
                  Save profile
                </button>
                <button className="secondary-button" type="button" onClick={exportAccount} disabled={loading}>
                  Export my data
                </button>
              </div>
            )}

            {tab === 'privacy' && (
              <div className="auth-form">
                <select value={profile.locationVisibility} onChange={(e) => setProfile({ ...profile, locationVisibility: e.target.value })}>
                  <option value="exact">Exact location on map</option>
                  <option value="district">District only (hide coordinates)</option>
                  <option value="hidden">Hidden location</option>
                </select>
                <button className="primary-button" type="button" onClick={saveProfile} disabled={loading}>
                  Save privacy
                </button>
              </div>
            )}

            {tab === 'security' && (
              <div className="auth-form">
                {sessions.map((session) => (
                  <div key={session.id} className="session-card">
                    <strong>{session.current ? 'Current device' : 'Other device'}</strong>
                    <p className="muted">{session.userAgent || 'Unknown browser'}</p>
                    <p className="muted">{session.ipAddress || 'Unknown IP'}</p>
                    {!session.current && (
                      <button className="secondary-button" type="button" onClick={() => logoutSession(session.id)}>
                        Logout device
                      </button>
                    )}
                  </div>
                ))}
                <button className="secondary-button" type="button" onClick={logoutAll}>
                  Logout all other devices
                </button>
                <input type="password" placeholder="Password to delete account" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                <button className="secondary-button" type="button" onClick={deleteAccount} disabled={loading}>
                  Delete account
                </button>
              </div>
            )}

            {tab === 'blocked' && (
              <div className="auth-form">
                {blocked.length === 0 && <p className="muted">Koi blocked user nahi.</p>}
                {blocked.map((blockedUser) => (
                  <div key={blockedUser.id} className="session-card">
                    <strong>{blockedUser.name}</strong>
                    <button className="secondary-button" type="button" onClick={() => unblockUser(blockedUser.id)}>
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      )}
    </>
  );
}
