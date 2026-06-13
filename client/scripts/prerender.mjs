import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { publicPagesMeta, loginMeta, navLinks, canonicalFor, SITE } from '../src/data/publicPages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const indexPath = resolve(distDir, 'index.html');

const template = readFileSync(indexPath, 'utf-8');

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const navHtml = (current) =>
  navLinks
    .map(
      (link) =>
        `<a href="${esc(link.href)}"${link.href === current ? ' aria-current="page"' : ''}>${esc(link.label)}</a>`
    )
    .join('');

const featureChips = ['Posts', 'Chat', 'OSM Map', '3D Globe', 'User Search', 'Email Verification']
  .map((chip) => `<span>${esc(chip)}</span>`)
  .join('');

const publicPageLinks = () =>
  navLinks.map((link) => ({
    '@type': 'WebPage',
    url: canonicalFor(link.href),
    name: link.label
  }));

const sectionsHtml = (sections = []) =>
  sections.length
    ? `<section class="public-sections">${sections
        .map((item) => `<article class="public-section-card"><h2>${esc(item.h)}</h2><p>${esc(item.p)}</p></article>`)
        .join('')}</section>`
    : '';

const faqHtml = (faqs = []) =>
  faqs.length
    ? `<section class="public-faq"><h2>Frequently asked questions</h2>${faqs
        .map((faq) => `<details class="public-faq-item"><summary>${esc(faq.q)}</summary><p>${esc(faq.a)}</p></details>`)
        .join('')}</section>`
    : '';

const footerHtml = () =>
  `<footer class="public-footer"><nav class="public-footer-nav">${navLinks
    .map((link) => `<a href="${esc(link.href)}">${esc(link.label)}</a>`)
    .join('')}</nav><p>© ${new Date().getFullYear()} RabtPoint — social location network.</p></footer>`;

const bodyHtml = (path, page) =>
  `<main class="public-shell"><header class="public-header"><a class="public-logo" href="/">RabtPoint</a><nav class="public-nav">${navHtml(
    path
  )}</nav></header><section class="public-hero"><div><p class="eyebrow">${esc(page.eyebrow)}</p><h1>${esc(
    page.title
  )}</h1><p>${esc(page.intro)}</p><a class="public-cta" href="${esc(page.ctaHref)}">${esc(
    page.cta
  )}</a></div><div class="public-feature-card">${featureChips}</div></section>${sectionsHtml(page.sections)}${faqHtml(
    page.faqs
  )}${footerHtml()}</main>`;

const jsonLd = (path, page) => {
  const canonical = canonicalFor(path);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: `${page.title} | RabtPoint`,
      description: page.description,
      isPartOf: { '@id': `${SITE}/#website` }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: page.eyebrow, item: canonical }])
      ]
    }
  ];

  if (path === '/') {
    graph.push(
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'RabtPoint',
        description: page.description,
        publisher: { '@id': `${SITE}/#organization` },
        hasPart: publicPageLinks()
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'RabtPoint',
        url: `${SITE}/`
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE}/#softwareapplication`,
        name: 'RabtPoint',
        url: `${SITE}/`,
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web, Android, iOS',
        description: page.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE}/download`
        },
        featureList: [
          'Location-based posts',
          'Direct chat',
          'People search by country, state and district',
          'OpenStreetMap user map',
          '3D globe view',
          'Email OTP verification'
        ],
        publisher: { '@id': `${SITE}/#organization` }
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#sitelinks`,
        name: 'RabtPoint site links',
        itemListElement: navLinks.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.label,
          url: canonicalFor(link.href)
        }))
      }
    );
  }

  if (page.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a }
      }))
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
};

const buildHtml = (path, page, body, structuredData) => {
  const canonical = canonicalFor(path);
  const title = esc(`${page.title} | RabtPoint`);
  const description = esc(page.description);

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(/<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(
    '</head>',
    `    <link rel="canonical" href="${canonical}" />\n    <script type="application/ld+json">${structuredData}</script>\n  </head>`
  );
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  return html;
};

const writePage = (path, html) => {
  if (path === '/') {
    writeFileSync(indexPath, html);
  } else {
    const outDir = resolve(distDir, path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), html);
  }
  console.log(`prerendered ${canonicalFor(path)}`);
};

let count = 0;

for (const [path, page] of Object.entries(publicPagesMeta)) {
  writePage(path, buildHtml(path, page, bodyHtml(path, page), jsonLd(path, page)));
  count += 1;
}

const loginPage = {
  eyebrow: 'Login',
  title: loginMeta.title,
  description: loginMeta.description,
  intro: loginMeta.intro,
  cta: 'Create account or sign in',
  ctaHref: '/login',
  sections: [],
  faqs: []
};
writePage('/login', buildHtml('/login', loginPage, bodyHtml('/login', loginPage), jsonLd('/login', loginPage)));
count += 1;

console.log(`Prerender complete: ${count} pages (site: ${SITE})`);
