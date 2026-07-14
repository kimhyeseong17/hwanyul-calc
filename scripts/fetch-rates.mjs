// 최신 환율 스냅샷 수집: open.er-api.com → data/rates.json  (의존성 0, API 키 불필요)
// 사용: node scripts/fetch-rates.mjs
// - 검증 통과 시에만 기록한다. 실패하면 기존 data/rates.json(마지막 정상 스냅샷)을 보존한다.
// - 응답 형태: { result:"success", base_code:"KRW", rates:{...}, time_last_update_utc, time_next_update_utc }
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = JSON.parse(await readFile(join(ROOT, "data", "site.json"), "utf8"));
const CURRENCIES = JSON.parse(await readFile(join(ROOT, "data", "currencies.json"), "utf8"));
const WANT = CURRENCIES.map((c) => c.code);
const OUT = join(ROOT, "data", "rates.json");

const API = process.env.RATES_API || SITE.ratesApi || "https://open.er-api.com/v6/latest/KRW";

function toIso(s) {
  // "Tue, 14 Jul 2026 00:02:31 +0000" → ISO. 파싱 실패 시 원문 유지.
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t).toISOString() : String(s || "");
}

async function main() {
  console.log(`[fetch-rates] 요청: ${API}`);
  let json;
  try {
    const res = await fetch(API, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = await res.json();
  } catch (e) {
    console.error(`❌ 환율 API 호출 실패: ${e.message} — 기존 rates.json 유지`);
    process.exit(1);
  }

  // --- 검증: 기록 전에 반드시 통과해야 한다 ---
  if (json.result && json.result !== "success") {
    console.error(`❌ API result=${json.result} — 기존 rates.json 유지`);
    process.exit(1);
  }
  const base = json.base_code || json.base;
  if (base !== "KRW") {
    console.error(`❌ base_code 가 KRW 가 아님(${base}) — 기존 rates.json 유지`);
    process.exit(1);
  }
  const src = json.rates || {};
  const sane = ["USD", "JPY", "EUR"].every((c) => Number.isFinite(src[c]) && src[c] > 0);
  if (!sane) {
    console.error(`❌ USD/JPY/EUR 환율이 비정상 — 기존 rates.json 유지`);
    process.exit(1);
  }

  // 우리가 쓰는 통화만 추려 스냅샷을 작게 유지한다.
  const rates = {};
  const missing = [];
  for (const code of WANT) {
    const v = code === "KRW" ? 1 : src[code];
    if (Number.isFinite(v) && v > 0) rates[code] = v;
    else missing.push(code);
  }
  if (missing.length) console.warn(`⚠️  API 응답에 없는 통화(제외): ${missing.join(", ")}`);

  const out = {
    base: "KRW",
    rates,
    updated: toIso(json.time_last_update_utc),
    nextUpdate: toIso(json.time_next_update_utc),
    source: "open.er-api.com",
    fetchedAt: new Date().toISOString().slice(0, 10),
  };

  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✅ data/rates.json 기록: 통화 ${Object.keys(rates).length}개, 기준시각 ${out.updated}`);
  console.log(`   USD=${rates.USD}  JPY=${rates.JPY}  EUR=${rates.EUR}`);
}

main();
