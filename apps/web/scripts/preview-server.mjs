// Serves the static export (apps/web/out) under the GitHub Pages base path so
// the deployed site — including the Pagefind search index, which only exists
// after a static export — can be exercised locally exactly as in production.
// Run via `pnpm --filter tablecn-web preview` (which builds first).
//   node apps/web/scripts/preview-server.mjs
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { dirname, extname, join, normalize } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out")
const BASE = "/tablecn" // matches next.config.ts basePath in GITHUB_PAGES mode
const PORT = 3000
const HOME = `${BASE}/docs/`

if (!existsSync(OUT)) {
  console.error(
    "[preview] No static export found at apps/web/out.\n" +
      "          Build it first: GITHUB_PAGES=true pnpm --filter tablecn-web build"
  )
  process.exit(1)
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
}

/** Resolve a request path to a file inside OUT, mirroring static-export rules. */
function resolveFile(pathname) {
  // Strip the base path; anything outside it has no file.
  if (pathname === BASE) return join(OUT, "index.html")
  if (!pathname.startsWith(`${BASE}/`)) return null
  const rel = normalize(pathname.slice(BASE.length)).replace(
    /^(\.\.[/\\])+/,
    ""
  )
  const target = join(OUT, rel)
  const candidates = pathname.endsWith("/")
    ? [join(target, "index.html")]
    : [target, `${target}.html`, join(target, "index.html")]
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`)

  // Send root traffic to the docs landing page, like the deployed redirect.
  if (pathname === "/" || pathname === BASE) {
    res.writeHead(302, { Location: HOME })
    res.end()
    return
  }

  const file = resolveFile(decodeURIComponent(pathname))
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("404 Not Found")
    return
  }

  res.writeHead(200, {
    "Content-Type": MIME[extname(file)] ?? "application/octet-stream",
  })
  createReadStream(file).pipe(res)
})

server.listen(PORT, () => {
  console.log(
    `[preview] Serving apps/web/out at http://localhost:${PORT}${HOME}`
  )
  console.log("[preview] Press ⌘K / Ctrl+K on a docs page to test search.")
})
