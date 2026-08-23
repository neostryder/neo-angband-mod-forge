#!/usr/bin/env node
/**
 * Serve the repository so `tools/preview.html` can look at the workshop.
 *
 * WHY A SERVER AT ALL. The harness is a module script that imports `plugin.js`
 * from beside it, and no browser resolves a relative module import over `file://`.
 * That is the browser's rule rather than anything about this mod, and it is the
 * same rule that decides `plugin.js` may carry no bare specifier.
 *
 * DELIBERATELY THE SMALLEST THING THAT WORKS. No dependency, no watch, no
 * livereload, and it serves the repository read-only on the loopback interface
 * only. A preview harness that grew features would be a second build system.
 */

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const PORT = Number(process.env["PORT"] ?? 8317);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let wanted;
  try {
    wanted = url.pathname === "/" ? "/tools/preview.html" : decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("malformed request path");
    return;
  }

  /* Refuse anything that climbs out of the repository. A string-prefix check
   * (`file.startsWith(ROOT)`) accepts a prefix-matching SIBLING directory, e.g.
   * "C:\repo-secret" starts with "C:\repo". `relative()` is path-aware: it only
   * comes back with a leading ".." when `file` actually falls outside `ROOT`. */
  const file = normalize(join(ROOT, wanted));
  const rel = relative(ROOT, file);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    response.writeHead(403).end("outside the repository");
    return;
  }

  let stats;
  try {
    stats = statSync(file);
  } catch {
    response.writeHead(404).end("no such file");
    return;
  }
  if (!stats.isFile()) {
    response.writeHead(404).end("not a file");
    return;
  }

  response.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "content-length": String(stats.size),
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ModForge preview: http://127.0.0.1:${PORT}/`);
  console.log("Every engine seam is absent here, which is what a player sees today.");
  console.log("Ctrl-C to stop.");
});
