// 정적 사이트 생성: data/*.json → dist/  (의존성 0)
// 사용: node scripts/build.mjs   (BUILD_DATE=YYYY-MM-DD 로 기준일 고정 가능)
import { readFile, writeFile, mkdir, rm, copyFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  renderIndex, renderPair, staticPages, renderStaticPage,
  renderManifest, renderServiceWorker, renderAppJs,
  renderSitemap, searchIndex, ROBOTS,
} from "./lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const STATIC = join(ROOT, "static");
const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

const readJson = async (name) => JSON.parse(await readFile(join(ROOT, "data", name), "utf8"));

const currencies = (await readJson("currencies.json"))
  .filter((c) => !c.disabled)
  .sort((a, b) => (a.order || 0) - (b.order || 0));
const pairs = await readJson("pairs.json");
const rates = await readJson("rates.json");

await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, "pair"), { recursive: true });

const paths = ["/"];

// 홈 (계산기 앱)
const indexHtml = renderIndex(currencies, rates, today);
await writeFile(join(DIST, "index.html"), indexHtml, "utf8");

// 통화쌍 SEO 랜딩
for (const p of pairs) {
  await writeFile(join(DIST, "pair", `${p.slug}.html`), renderPair(p, currencies, rates), "utf8");
  paths.push(`/pair/${p.slug}.html`);
}

// 정적 페이지
for (const p of staticPages(today)) {
  await writeFile(join(DIST, p.path.replace(/^\//, "")), renderStaticPage(p), "utf8");
  paths.push(p.path);
}

// PWA 산출물
const appJs = renderAppJs();
const manifest = renderManifest();
// SW 캐시 버전 = 기준일 + 콘텐츠 해시(app.js·홈·매니페스트). 코드/환율/문안이 바뀌면
// 해시가 바뀌어 셸 캐시가 무효화되고, 동일하면 불필요한 무효화가 없다.
const hash = createHash("sha1").update(appJs).update(indexHtml).update(manifest).digest("hex").slice(0, 10);
const version = `${today}.${hash}`;
const shellUrls = [
  "/", "/index.html", "/app.js", "/manifest.webmanifest",
  "/icon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png",
  ...pairs.map((p) => `/pair/${p.slug}.html`),
  ...staticPages(today).map((p) => p.path),
];
await writeFile(join(DIST, "app.js"), appJs, "utf8");
await writeFile(join(DIST, "sw.js"), renderServiceWorker(version, shellUrls), "utf8");
await writeFile(join(DIST, "manifest.webmanifest"), manifest, "utf8");

// 환율 스냅샷(첫 페인트·오프라인 폴백용)
await writeFile(join(DIST, "rates.json"), JSON.stringify(rates), "utf8");

// 아이콘 등 정적 에셋 복사
let iconCount = 0;
try {
  for (const f of await readdir(STATIC)) {
    await copyFile(join(STATIC, f), join(DIST, f));
    iconCount++;
  }
} catch (e) {
  console.warn(`⚠️  static/ 복사 건너뜀: ${e.message} — 먼저 'node scripts/gen-icons.mjs' 를 실행하세요`);
}

// SEO 산출물
await writeFile(join(DIST, "sitemap.xml"), renderSitemap(paths, today), "utf8");
await writeFile(join(DIST, "robots.txt"), ROBOTS, "utf8");
await writeFile(join(DIST, "search-index.json"), JSON.stringify(searchIndex(pairs)), "utf8");

console.log(`✅ 생성 완료 (기준일 ${today}, SW ver ${version})`);
console.log(`   index.html 1개 (계산기 앱)`);
console.log(`   pair/*.html ${pairs.length}개 (통화쌍 랜딩)`);
console.log(`   정적 ${staticPages(today).length}개 + app.js · sw.js · manifest.webmanifest`);
console.log(`   rates.json (통화 ${Object.keys(rates.rates || {}).length}개, 기준 ${rates.updated || "-"})`);
console.log(`   아이콘 ${iconCount}개 복사 · sitemap.xml (${paths.length} URL) · robots.txt · search-index.json`);
