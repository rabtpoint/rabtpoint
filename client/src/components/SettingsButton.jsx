import { useApp } from '../context/AppContext';
export default function SettingsButton(){ const {theme,setTheme}=useApp(); return <div className="settings-card"><span>Settings</span><button className="pill-button" type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'Dark mode':'Light mode'}</button></div>; }
