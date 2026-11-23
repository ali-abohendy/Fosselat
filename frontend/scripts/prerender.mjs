import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const distDir = path.resolve('dist');
const ssrEntry = path.resolve('.ssr-temp/entry-prerender.js');
const templatePath = path.join(distDir, 'index.html');

function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function run() {
  const template = fs.readFileSync(templatePath, 'utf8');
  const { render, PRERENDER_ROUTES } = await import(pathToFileURL(ssrEntry).href);

  let count = 0;
  for (const route of PRERENDER_ROUTES) {
    try {
      const appHtml = render(route.path);
      const canonicalUrl = `https://fosselatacademy.com${route.path === '/' ? '/' : route.path}`;

      let html = template
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace(/<title>.*?<\/title>/i, `<title>${escapeHtmlAttr(route.title)}</title>`)
        .replace(
          /<meta name="description" content="[^"]*"\s*\/>/i,
          `<meta name="description" content="${escapeHtmlAttr(route.description)}" />`
        )
        .replace(
          /<link rel="canonical" href="[^"]*"\s*\/>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`
        )
        .replace(
          /<meta property="og:title" content="[^"]*"\s*\/>/i,
          `<meta property="og:title" content="${escapeHtmlAttr(route.title)}" />`
        )
        .replace(
          /<meta property="og:description" content="[^"]*"\s*\/>/i,
          `<meta property="og:description" content="${escapeHtmlAttr(route.description)}" />`
        )
        .replace(
          /<meta property="og:url" content="[^"]*"\s*\/>/i,
          `<meta property="og:url" content="${canonicalUrl}" />`
        );

      const outPath =
        route.path === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, route.path.replace(/^\//, ''), 'index.html');

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');
      count++;
      console.log(`[prerender] ${route.path} -> ${path.relative(distDir, outPath)} (${html.length} bytes)`);
    } catch (err) {
      console.error(`[prerender] Failed on route ${route.path}:`, err);
      process.exitCode = 1;
    }
  }

  // Clean up temporary SSR bundle
  fs.rmSync(path.resolve('.ssr-temp'), { recursive: true, force: true });
  console.log(`[prerender] Done! Prerendered ${count} routes.`);
}

run();
