import { useEffect, useMemo, useState } from 'react';
import AuthGate from './components/AuthGate';
import AppHeader from './components/AppHeader';
import { BottomNav } from './components/AppNav';
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
import { initialTrendSearch, normalizeCountry } from './utils/trendCountry';

function AppContent() {
  const path = window.location.pathname;
  const { user } = useApp();
  const [activePage, setActivePage] = useState(0);
  const [profileUser, setProfileUser] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [trendSearch, setTrendSearch] = useState(() => initialTrendSearch(user));
  const [discoverRefresh, setDiscoverRefresh] = useState(0);

  useEffect(() => {
    if (user) setTrendSearch(initialTrendSearch(user));
  }, [user?.id]);

  const userCountry = useMemo(
    () => user?.location?.country || normalizeCountry(trendSearch, 'United Kingdom'),
    [user, trendSearch]
  );

  const openSettings = (tab = 'profile') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

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
      <AppHeader
        trend={trendSearch}
        onTrendChange={setTrendSearch}
        onTrendApply={() => setDiscoverRefresh((value) => value + 1)}
        onViewProfile={setProfileUser}
        onOpenSettings={openSettings}
      />

      <div className="page-window">
        <div className="page-track" style={{ transform: `translateX(-${activePage * 100}%)` }}>
          <FeedPage
            onProfile={setProfileUser}
            trend={trendSearch}
            userCountry={userCountry}
            refreshKey={discoverRefresh}
          />
          <FriendsPage onProfile={setProfileUser} currentUser={user} />
          <ChatPage currentUser={user} />
          <MapPage onProfile={setProfileUser} />
          <SearchPage onProfile={setProfileUser} />
        </div>
      </div>

      <BottomNav activePage={activePage} onSelect={setActivePage} />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
        showTrigger={false}
      />

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
