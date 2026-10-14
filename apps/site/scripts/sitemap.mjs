/*
 * Writes dist/sitemap.xml from the pages `expo export` rendered, so a new page
 * is listed without editing anything. Expo Router's own pages (`_sitemap`,
 * `+not-found`) are left out. The addresses match each page's canonical:
 * clean URLs, no trailing slash except the root.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://sileo.rayanstudio.dev';
const DIST = fileURLToPath(new URL('../dist', import.meta.url));

function pages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('_') || entry.name.startsWith('+')) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name.endsWith('.html') ? [relative(DIST, path)] : [];
  });
}

const urls = pages(DIST)
  .map((file) => {
    const route = `/${file.replace(/\.html$/, '').replace(/(^|\/)index$/, '')}`;
    return route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`;
  })
  .sort();

writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`
);

console.log(`sitemap.xml: ${urls.length} pages`);
