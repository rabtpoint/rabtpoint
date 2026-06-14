import { urls } from '../config/urls';

const getToken = () => localStorage.getItem('rabtpoint_token');
const getRefreshToken = () => localStorage.getItem('rabtpoint_refresh_token');

export const saveSession = ({ token, refreshToken, user }) => {
  localStorage.setItem('rabtpoint_token', token);
  if (refreshToken) localStorage.setItem('rabtpoint_refresh_token', refreshToken);
  localStorage.setItem('rabtpoint_user', JSON.stringify(user));
};

export const readSession = () => {
  const token = localStorage.getItem('rabtpoint_token');
  const user = localStorage.getItem('rabtpoint_user');
  return { token, refreshToken: getRefreshToken(), user: user ? JSON.parse(user) : null };
};

export const clearSession = () => {
  localStorage.removeItem('rabtpoint_token');
  localStorage.removeItem('rabtpoint_refresh_token');
  localStorage.removeItem('rabtpoint_user');
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Session expired. Login again.');

  const response = await fetch(`${urls.api}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Session expired. Login again.');

  saveSession(data);
  return data.token;
};

export const api = async (path, options = {}, retry = true) => {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${urls.api}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Cannot reach API server. Run backend: cd server && npm run dev');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && retry && getRefreshToken() && !path.startsWith('/auth/refresh')) {
    try {
      const nextToken = await refreshAccessToken();
      return api(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${nextToken}` } }, false);
    } catch {
      clearSession();
    }
  }

  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const uploadImage = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  const path = token ? '/uploads/image' : '/uploads/signup-image';
  const response = await fetch(`${urls.api}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Image upload failed');
  return data;
};

export const uploadVideo = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('video', file);
  const response = await fetch(`${urls.api}/uploads/video`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Video upload failed');
  return data;
};

export const fetchDiscover = async (country) => {
  const params = new URLSearchParams({ country });
  return api(`/discover?${params.toString()}`);
};
