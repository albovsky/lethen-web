// Stamps every reference to site.js and favicon.svg in public/*.html with a
// hash of the file (?v=...). public/_headers caches both for a year, so a new
// hash is what makes browsers fetch a changed file. wrangler runs this before
// every deploy and `wrangler dev` (build.command in wrangler.jsonc); run it by
// hand after editing either file. `--check` only reports stale references.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dir = new URL("../public/", import.meta.url);
const assets = ["site.js", "favicon.svg"];
const check = process.argv.includes("--check");
const stale = [];

const versions = assets.map((name) => [
  name,
  createHash("sha256").update(readFileSync(new URL(name, dir))).digest("hex").slice(0, 10),
]);

for (const page of readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const path = new URL(page, dir);
  const html = readFileSync(path, "utf8");
  let out = html;
  for (const [name, v] of versions) {
    const ref = new RegExp(`(["/])${name.replace(".", "\\.")}(\\?v=[0-9a-z]+)?(?=")`, "g");
    out = out.replace(ref, `$1${name}?v=${v}`);
  }
  if (out === html) continue;
  if (check) stale.push(page);
  else writeFileSync(path, out);
}

if (stale.length) {
  console.error(`Stale asset versions in ${stale.join(", ")}; run node scripts/stamp-assets.mjs`);
  process.exit(1);
}
