# Personal site

Bare, static, no dependencies. Content lives in `data.json`; `node build.mjs` regenerates the HTML.

```
node build.mjs     # regenerate pages
npx serve .        # or open index.html directly
```

Deploys to GitHub Pages via `.github/workflows/pages.yml` (repo Settings → Pages → Source: GitHub Actions).
If the site isn't served from the domain root, update `siteUrl` in `data.json`.
