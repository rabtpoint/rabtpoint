export const SITE = 'https://rabtpoint.com';

export const publicPagesMeta = {
  '/': {
    eyebrow: 'Home',
    title: 'RabtPoint social location network',
    description:
      'RabtPoint par posts share karo, users se chat karo, country-state-district se people search karo, aur OSM plus 3D globe map par verified user locations explore karo.',
    cta: 'Login / Open App',
    ctaHref: '/login'
  },
  '/download': {
    eyebrow: 'Download',
    title: 'Download RabtPoint app',
    description:
      'RabtPoint ka mobile experience responsive web app ke through available hai. Android aur iOS app download links yahan publish kiye jayenge.',
    cta: 'Use Web App',
    ctaHref: '/login'
  },
  '/career': {
    eyebrow: 'Career',
    title: 'Build the future of location based social networking',
    description:
      'RabtPoint me engineering, design, community, and operations roles ke liye updates yahan milenge. Passionate builders humse connect kar sakte hain.',
    cta: 'Join RabtPoint',
    ctaHref: 'mailto:careers@rabtpoint.com'
  },
  '/admin': {
    eyebrow: 'Admin',
    title: 'RabtPoint admin access',
    description:
      'Admin area platform management ke liye reserved hai. Authorized team members secure login ke baad dashboard access kar sakte hain.',
    cta: 'Go to Login',
    ctaHref: '/login'
  }
};

export const canonicalFor = (path) => (path === '/' ? `${SITE}/` : `${SITE}${path}`);
