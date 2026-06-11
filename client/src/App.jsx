import { useState } from 'react';
import AuthGate from './components/AuthGate';
import ProfileModal from './components/ProfileModal';
import SettingsButton from './components/SettingsButton';
import { AppProvider,useApp } from './context/AppContext';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
const pages=['Posts','Chat','Map','Search'];
function AppContent(){ const {user,logout}=useApp(); const [activePage,setActivePage]=useState(0); const [profileUser,setProfileUser]=useState(null); if(!user) return <AuthGate/>; return <main className="app-shell"><header className="topbar"><div><p className="eyebrow">Local + Website URLs ready</p><h1>RabtPoint</h1></div><nav className="page-nav">{pages.map((page,index)=><button className={activePage===index?'active':''} key={page} type="button" onClick={()=>setActivePage(index)}>{page}</button>)}</nav><div className="topbar-actions"><SettingsButton/><button className="secondary-button" type="button" onClick={logout}>Logout</button></div></header><div className="page-window"><div className="page-track" style={{transform:`translateX(-${activePage*100}%)`}}><FeedPage onProfile={setProfileUser}/><ChatPage currentUser={user}/><MapPage onProfile={setProfileUser}/><SearchPage onProfile={setProfileUser}/></div></div><nav className="mobile-nav">{pages.map((page,index)=><button className={activePage===index?'active':''} key={page} type="button" onClick={()=>setActivePage(index)}>{page}</button>)}</nav><ProfileModal user={profileUser} onClose={()=>setProfileUser(null)}/></main>; }
export default function App(){ return <AppProvider><AppContent/></AppProvider>; }
