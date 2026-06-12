import { useEffect } from 'react';
import { publicPagesMeta, canonicalFor } from '../data/publicPages.js';

export const isPublicPage = (path) => Boolean(publicPagesMeta[path]);

const setMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const setCanonical = (href) => {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

export default function PublicPage({ path }) {
  const page = publicPagesMeta[path] || publicPagesMeta['/'];

  useEffect(() => {
    document.title = `${page.title} | RabtPoint`;
    setMetaTag('description', page.description);
    setCanonical(canonicalFor(path));
  }, [path, page.title, page.description]);

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
