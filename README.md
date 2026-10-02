# lethen.dev

The source of [lethen.dev](https://lethen.dev), the website for
[Lethen](https://github.com/albovsky/lethen). It is plain HTML and CSS in
`public/`, served by a Cloudflare Worker with static assets (`wrangler.jsonc`).

Preview locally:

```sh
python3 -m http.server -d public
```

Deploy with `npx wrangler deploy`, or let the Cloudflare Workers build on `main` do it.

Keep the install text and numbers in sync with the Lethen repository: the
precision figure comes from `docs/validation/precision-corpus.md` and the
Periphery comparison from the 2026-10-02 measurement.

`archive/2026-09-25-draft/` holds an earlier draft of the site, kept for reference.
