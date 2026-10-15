# lethen.dev

The source of [lethen.dev](https://lethen.dev), the website for
[Lethen](https://github.com/albovsky/lethen). It is plain HTML, CSS and
JavaScript in `public/`, served by a Cloudflare Worker with static assets
(`wrangler.jsonc`). The page's CSS is inlined in `public/index.html`, so the
first paint needs no second request.

`public/_headers` caches `site.js` and `favicon.svg` for a year, and the pages
reference them as `?v=<hash>`. `scripts/stamp-assets.mjs` updates those hashes;
wrangler runs it before every deploy and `wrangler dev`, and after editing
either file run `node scripts/stamp-assets.mjs` so the committed pages match.

Preview locally:

```sh
python3 -m http.server -d public
```

Deploy with `npx wrangler deploy`, or let the Cloudflare Workers build on `main` do it.

Keep the install text and numbers in sync with the Lethen repository: the
precision figure comes from `docs/validation/precision-corpus.md` and the
Periphery comparison from the 2026-10-02 measurement.

`archive/2026-09-25-draft/` holds an earlier draft of the site, kept for reference.
