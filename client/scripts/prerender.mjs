import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { publicPagesMeta, canonicalFor, SITE } from '../src/data/publicPages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const indexPath = resolve(distDir, 'index.html');

const template = readFileSync(indexPath, 'utf-8');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildHtml = (path, meta) => {
  const canonical = canonicalFor(path);
  const title = escapeHtml(`${meta.title} | RabtPoint`);
  const description = escapeHtml(meta.description);

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${description}" />`
  );

  html = html.replace(
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${title}" />`
  );

  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${description}" />`
  );

  html = html.replace(
    /<meta\s+property="og:url"[\s\S]*?\/>/,
    `<meta property="og:url" content="${canonical}" />`
  );

  html = html.replace('</head>', `    <link rel="canonical" href="${canonical}" />\n  </head>`);

  return html;
};

let count = 0;

for (const [path, meta] of Object.entries(publicPagesMeta)) {
  const html = buildHtml(path, meta);

  if (path === '/') {
    writeFileSync(indexPath, html);
  } else {
    const outDir = resolve(distDir, path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), html);
  }

  count += 1;
  console.log(`prerendered ${canonicalFor(path)}`);
}

console.log(`Prerender complete: ${count} pages (site: ${SITE})`);
