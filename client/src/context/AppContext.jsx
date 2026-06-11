import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import { clearSession,readSession,saveSession } from '../services/api';
const AppContext=createContext(null);
export const AppProvider=({children})=>{ const [session,setSession]=useState(()=>readSession()); const [theme,setTheme]=useState(()=>localStorage.getItem('rabtpoint_theme')||'dark'); useEffect(()=>{document.documentElement.dataset.theme=theme; localStorage.setItem('rabtpoint_theme',theme);},[theme]); const value=useMemo(()=>({user:session.user,token:session.token,theme,setTheme,login(next){saveSession(next);setSession(next);},logout(){clearSession();setSession({token:null,user:null});}}),[session,theme]); return <AppContext.Provider value={value}>{children}</AppContext.Provider>; };
export const useApp=()=>useContext(AppContext);
