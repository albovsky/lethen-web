# lethen.sh

A small, dependency-free static website. Serve this directory with any static web server; there is no build step.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory .
```

Run this command from the `lethen-web` project directory, then open http://localhost:4173. Installation text and commands follow [lethen’s README](https://github.com/albovsky/lethen#readme) and [user guide](https://github.com/albovsky/lethen/blob/master/docs/guide.md). Keep them in sync when requirements change. The site works without JavaScript; JavaScript adds clipboard copying with accessible feedback and a manual-selection fallback.

Deployment and domain configuration are not included. Publish `index.html`, `style.css`, `site.js`, and `icon.svg` from this directory when a hosting destination is chosen.
