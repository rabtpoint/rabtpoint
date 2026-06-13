import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearSession, readSession, saveSession } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(() => readSession());
  const [theme, setTheme] = useState(() => localStorage.getItem('rabtpoint_theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('rabtpoint_theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      theme,
      setTheme,
      login(next) {
        saveSession(next);
        setSession(readSession());
      },
      updateUser(user) {
        saveSession({ token: session.token, refreshToken: readSession().refreshToken, user });
        setSession(readSession());
      },
      logout() {
        clearSession();
        setSession({ token: null, user: null });
      }
    }),
    [session, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);

export const refreshCurrentUser = async (updateUser) => {
  const data = await api('/auth/me');
  updateUser(data.user);
};
