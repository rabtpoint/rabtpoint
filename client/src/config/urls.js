const FALLBACK_API = 'http://localhost:5000/api';

const isLocalOrPrivateHost = (hostname) => {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

  return (
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
};

const resolveApiUrl = () => {
  const envApi = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;

    // Local dev (localhost) ya network IP (phone/LAN) se khole to
    // backend ko bhi usi host ke port 5000 par call karo.
    if (isLocalOrPrivateHost(hostname)) {
      return `${protocol}//${hostname}:5000/api`;
    }
  }

  // Production / custom domain: env wala API URL use karo.
  return envApi || FALLBACK_API;
};

export const urls = {
  api: resolveApiUrl(),
  local: import.meta.env.VITE_LOCAL_URL || 'http://localhost:5173',
  website: import.meta.env.VITE_WEBSITE_URL || 'https://rabtpoint.com'
};
