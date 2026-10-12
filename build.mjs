// Generates the static site from data.json. Usage: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(root, 'data.json'), 'utf8'));

const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pages = [
  { file: 'index.html', nav: 'About', title: d.name, desc: `${d.name}: ${d.tagline}.` },
  { file: 'experience.html', nav: 'Experience', title: 'Experience', desc: `Work, research and education of ${d.name}.` },
  { file: 'projects.html', nav: 'Projects', title: 'Projects', desc: `Things ${d.name} has built.` },
  { file: 'awards.html', nav: 'Awards', title: 'Awards', desc: `Fellowships, competitions and awards of ${d.name}.` },
  { file: 'reading.html', nav: 'Reading', title: 'Reading', desc: 'Books worth rereading.' }
];

const ext = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;

function layout(page, body, { robots = '', canonical = true } = {}) {
  const fullTitle = page.file === 'index.html' ? d.name : `${page.title} · ${d.name}`;
  const url = `${d.siteUrl}/${page.file === 'index.html' ? '' : page.file}`;
  const nav = pages
    .map(p => `<li><a href="${p.file}"${p.file === page.file ? ' aria-current="page"' : ''}>${p.nav}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(page.desc)}">
${robots ? `<meta name="robots" content="${robots}">\n` : ''}${canonical ? `<link rel="canonical" href="${esc(url)}">\n` : ''}<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(page.desc)}">
<meta property="og:type" content="website">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="wrap">
<header class="side">
<nav aria-label="Primary"><ul>${nav}</ul></nav>
<nav aria-label="Elsewhere" class="ext"><ul>
<li>${ext(d.github, 'GitHub')}</li>
<li>${ext(d.linkedin, 'LinkedIn')}</li>
<li>${ext(d.cv, 'CV')}</li>
<li><a href="mailto:${esc(d.email)}">Email</a></li>
</ul></nav>
</header>
<main id="main">
${body}
</main>
</div>
</body>
</html>
`;
}

const list = pts => (pts.length ? `<ul>${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '');

const entry = e => `<article class="entry">
<h3>${e.url ? ext(e.url, esc(e.org)) : esc(e.org)}</h3>
<p class="meta">${esc(e.role)} · ${esc(e.place)} · ${esc(e.dates)}</p>
${list(e.points)}
</article>`;

const body = {
  'index.html': () => `<h1 class="sr">${esc(d.name)}</h1>
${d.about.map(p => `<p>${esc(p)}</p>`).join('\n')}
<p>${ext(d.cv, 'CV')} · ${ext(d.github, 'GitHub')} · ${ext(d.linkedin, 'LinkedIn')} · <a href="mailto:${esc(d.email)}">${esc(d.email)}</a></p>
<h2>Feats</h2>
<ul class="feats">
${d.feats.map(f => `<li>${esc(f)}</li>`).join('')}
</ul>
<h2>News</h2>
<dl class="news">
${d.news.map(n => `<dt>${esc(n.date)}</dt><dd>${esc(n.text)}</dd>`).join('\n')}
</dl>`,

  'experience.html': () => `<h1>Experience</h1>
${d.experience.map(entry).join('\n')}
<h2>Education</h2>
${d.education.map(entry).join('\n')}
<h2>Skills</h2>
<p>${esc(d.skills)}</p>
<h2>Languages</h2>
<p>${esc(d.languages)}</p>
<h2>Interests</h2>
<p>${esc(d.interests)}</p>`,

  'projects.html': () => `<h1>Projects</h1>
${d.projects
  .map(
    p => `<article class="entry">
<h3>${esc(p.name)}</h3>
<p class="meta">${esc(p.stack)}</p>
<p>${esc(p.text)}</p>
</article>`
  )
  .join('\n')}`,

  'awards.html': () => `<h1>Awards</h1>
${d.awards
  .map(
    a => `<article class="entry">
<h3>${esc(a.title)}</h3>
<p class="meta">${esc(a.by)} · ${esc(a.date)}</p>
<p>${esc(a.text)}</p>
</article>`
  )
  .join('\n')}`,

  'reading.html': () => `<h1>Reading</h1>
<p class="sub">Books worth rereading.</p>
${d.reading
  .map(
    b => `<article class="entry">
<h3>${esc(b.title)}</h3>
<p class="meta">${esc(b.author)} · ${esc(b.year)}</p>
<p>${esc(b.text)}</p>
</article>`
  )
  .join('\n')}`
};

for (const p of pages) writeFileSync(join(root, p.file), layout(p, body[p.file]()));

const nf = { file: '404.html', title: 'Not found', nav: '', desc: 'Page not found.' };
writeFileSync(
  join(root, '404.html'),
  layout(
    nf,
    `<h1>Not found</h1>
<p>That page doesn't exist. <a href="${d.siteUrl}/">Go to the home page</a>.</p>`,
    { robots: 'noindex', canonical: false }
  ).replace(/href="(index|experience|projects|awards|reading)\.html"/g, `href="${d.siteUrl}/$1.html"`)
    .replace('href="style.css"', `href="${d.siteUrl}/style.css"`)
    .replace('href="favicon.svg"', `href="${d.siteUrl}/favicon.svg"`)
);

writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `<url><loc>${d.siteUrl}/${p.file === 'index.html' ? '' : p.file}</loc></url>`).join('\n')}
</urlset>
`
);
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${d.siteUrl}/sitemap.xml\n`);
console.log('Built', pages.length + 1, 'pages');
