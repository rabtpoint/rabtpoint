const publicPages = {
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

export const isPublicPage = (path) => Boolean(publicPages[path]);

export default function PublicPage({ path }) {
  const page = publicPages[path] || publicPages['/'];

  return (
    <main className="public-shell">
      <header className="public-header">
        <a className="public-logo" href="/">
          RabtPoint
        </a>
      </header>

      <section className="public-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <a className="public-cta" href={page.ctaHref}>
            {page.cta}
          </a>
        </div>
        <div className="public-feature-card">
          <span>Posts</span>
          <span>Chat</span>
          <span>OSM Map</span>
          <span>3D Globe</span>
          <span>User Search</span>
          <span>Email Verification</span>
        </div>
      </section>
    </main>
  );
}
