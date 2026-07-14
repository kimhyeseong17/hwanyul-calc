// dist/ 정적 파일 로컬 서버 (의존성 0) — 확인용
// 사용: node scripts/serve.mjs   (PORT 환경변수로 포트 변경)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize as pnorm } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/") p = "/index.html";
    let file = pnorm(join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("forbidden"); return; }
    let body;
    try {
      body = await readFile(file);
    } catch {
      // 확장자 없는 경로 → .html 폴백
      if (!/\.[a-z0-9]+$/i.test(p)) { file = pnorm(join(ROOT, p + ".html")); body = await readFile(file); }
      else throw new Error("not found");
    }
    const ext = file.slice(file.lastIndexOf("."));
    res.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end("<h1>404</h1>");
  }
});

server.listen(PORT, () => console.log(`✅ http://localhost:${PORT} 에서 dist/ 제공 중`));
