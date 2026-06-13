import { useState } from 'react';
import AuthGate from './components/AuthGate';
import { DesktopNav, MobileNav } from './components/AppNav';
import ProfileModal from './components/ProfileModal';
import SettingsPanel from './components/SettingsPanel';
import AdminPage from './pages/AdminPage';
import { AppProvider, useApp } from './context/AppContext';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import FriendsPage from './pages/FriendsPage';
import MapPage from './pages/MapPage';
import PublicPage, { isPublicPage } from './pages/PublicPage';
import SearchPage from './pages/SearchPage';

function AppContent() {
  const path = window.location.pathname;
  const { user, logout, theme, setTheme } = useApp();
  const [activePage, setActivePage] = useState(0);
  const [profileUser, setProfileUser] = useState(null);

  if (!user) {
    if (path !== '/' && isPublicPage(path)) return <PublicPage path={path} />;
    return <AuthGate />;
  }

  if (path === '/admin' && user.isAdmin) {
    return (
      <main className="app-shell">
        <AdminPage />
      </main>
    );
  }

  if (path !== '/' && isPublicPage(path)) return <PublicPage path={path} />;

  return (
    <main className="app-shell neon-app">
      <header className="topbar neon-topbar">
        <div className="brand-block">
          <span className="brand-glow">RabtPoint</span>
        </div>
        <DesktopNav activePage={activePage} onSelect={setActivePage} />
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <SettingsPanel />
          {user.isAdmin && (
            <a className="secondary-button" href="/admin">
              Admin
            </a>
          )}
          <button className="secondary-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="page-window">
        <div className="page-track" style={{ transform: `translateX(-${activePage * 100}%)` }}>
          <FeedPage onProfile={setProfileUser} />
          <FriendsPage onProfile={setProfileUser} currentUser={user} />
          <ChatPage currentUser={user} />
          <MapPage onProfile={setProfileUser} />
          <SearchPage onProfile={setProfileUser} />
        </div>
      </div>

      <MobileNav activePage={activePage} onSelect={setActivePage} />
      <ProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
