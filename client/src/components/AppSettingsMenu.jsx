import { useState } from 'react';
import Avatar from './Avatar';
import { IconLogout, IconMenu, IconProfile, IconShield } from './NavIcons';
import { useApp } from '../context/AppContext';

export default function AppSettingsMenu({ onViewProfile, onOpenSettings }) {
  const { user, theme, setTheme, logout } = useApp();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const close = () => setOpen(false);

  const run = (action) => {
    close();
    action();
  };

  return (
    <>
      <button className="settings-hamburger" type="button" aria-label="Settings menu" onClick={() => setOpen(true)}>
        <IconMenu />
      </button>

      {open && (
        <div className="settings-drawer-backdrop" onClick={close}>
          <aside className="settings-drawer" onClick={(event) => event.stopPropagation()}>
            <header className="settings-drawer-head">
              <div>
                <p className="settings-title">Settings</p>
                <div className="settings-drawer-user">
                  <Avatar user={user} />
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
              </div>
              <button className="icon-btn" type="button" aria-label="Close menu" onClick={close}>
                ×
              </button>
            </header>

            <nav className="settings-drawer-menu">
              <button type="button" onClick={() => run(() => onViewProfile?.(user))}>
                <IconProfile /> Profile
              </button>

              <button
                className="settings-menu-pill"
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </button>

              <button className="settings-menu-pill" type="button" onClick={() => run(() => onOpenSettings?.('profile'))}>
                Open
              </button>

              <button type="button" onClick={() => run(() => onOpenSettings?.('privacy'))}>
                <IconShield /> Privacy
              </button>
              <button type="button" onClick={() => run(() => onOpenSettings?.('security'))}>
                <IconShield /> Security & sessions
              </button>
              <button type="button" onClick={() => run(() => onOpenSettings?.('blocked'))}>
                <IconShield /> Blocked users
              </button>

              {user.isAdmin && (
                <a href="/admin" onClick={close}>
                  Admin dashboard
                </a>
              )}

              <button className="settings-menu-pill logout-pill" type="button" onClick={() => run(logout)}>
                <IconLogout /> Logout
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
