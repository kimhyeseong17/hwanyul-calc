// 공유 유틸: 템플릿 · CSS · 계산기 위젯 · app.js/sw.js/manifest 생성 (의존성 0)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE = JSON.parse(readFileSync(join(ROOT, "data", "site.json"), "utf8"));

export function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
export function slug(s = "") {
  return String(s).trim().replace(/[^0-9A-Za-z가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "etc";
}
function stripTags(s = "") { return String(s).replace(/<[^>]*>/g, ""); }

// ---------- CSS ----------
const CSS = `
:root{--bg:#f4f7f8;--fg:#132025;--mut:#5c6b72;--line:#e2e8ea;--soft:#eaf1f2;--brand:#0b7285;--brand-d:#0a6072;--brand-soft:#e0f0f2;--ok:#1a9e6a;--warn:#c0562f;--card:#fff;--shadow:0 1px 2px rgba(10,40,45,.04),0 6px 20px rgba(10,40,45,.06);--radius:16px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Malgun Gothic','Apple SD Gothic Neo',sans-serif;color:var(--fg);background:var(--bg);line-height:1.65;-webkit-font-smoothing:antialiased;padding-bottom:env(safe-area-inset-bottom)}
a{color:var(--brand-d);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:640px;margin:0 auto;padding:0 18px}
header.top{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.88);backdrop-filter:saturate(180%) blur(10px);border-bottom:1px solid var(--line);padding-top:env(safe-area-inset-top)}
header.top .bar{display:flex;align-items:center;justify-content:space-between;height:56px;max-width:640px;margin:0 auto;padding:0 18px}
.logo{font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--fg);display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.logo .m{width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--brand);color:#fff;font-size:15px;font-weight:800}
.logo b{color:var(--brand-d)}
nav.gnb{display:flex;gap:2px;align-items:center}
nav.gnb a{color:var(--mut);font-size:13.5px;font-weight:600;padding:7px 9px;border-radius:9px}
nav.gnb a:hover{color:var(--fg);background:var(--soft);text-decoration:none}
.hero{padding:30px 0 6px}
.hero h1{font-size:25px;line-height:1.28;letter-spacing:-.03em;margin:0 0 8px;font-weight:800}
.hero .sub{font-size:15px;color:var(--mut);margin:0}
.crumb{color:var(--mut);font-size:13px;margin:16px 0 2px}
.crumb a{color:var(--mut)}
.ptitle{font-size:23px;line-height:1.3;letter-spacing:-.02em;margin:6px 0 8px;font-weight:800}
.lead{font-size:15px;color:#3f4b51;margin:8px 0 4px}
.notice{background:#fff6ea;border:1px solid #f0e0c0;border-radius:10px;padding:11px 14px;font-size:12.5px;color:#84631f;margin:14px 0}
.sec{font-size:18px;font-weight:800;margin:30px 0 4px;letter-spacing:-.02em}
.sec .sub{display:block;font-size:13px;font-weight:500;color:var(--mut);margin-top:3px}
.chiprow{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.chip{font-size:13.5px;background:var(--card);color:var(--brand-d);border:1px solid var(--line);border-radius:999px;padding:7px 13px;font-weight:600}
.chip:hover{border-color:var(--brand);text-decoration:none;background:var(--brand-soft)}
/* ---- 환율 계산기 위젯 ---- */
.fx{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:14px 14px 16px;margin:16px 0}
.fx-off{background:#fdeee7;border:1px solid #f2c9b4;color:#a2451f;border-radius:10px;padding:9px 12px;font-size:12.5px;margin-bottom:12px}
.fx-head{display:flex;gap:10px;align-items:center;margin-bottom:12px}
.fx-sel{position:relative;flex:1}
.fx-sel select{width:100%;font-size:16px;font-weight:800;padding:12px 40px 12px 14px;border:1.5px solid var(--line);border-radius:12px;background:var(--soft);color:var(--fg);outline:none;-webkit-appearance:none;appearance:none;cursor:pointer}
.fx-sel select:focus{border-color:var(--brand)}
.fx-sel::after{content:"▾";position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--mut);pointer-events:none;font-size:13px}
.fx-swap{flex:0 0 auto;width:46px;height:46px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--brand-d);font-size:20px;font-weight:800;cursor:pointer;transition:transform .18s,background .12s}
.fx-swap:hover{background:var(--brand-soft)}
.fx-swap.spin{transform:rotate(180deg)}
.fx-cards{display:grid;gap:7px}
.fx-card{border:1.5px solid var(--line);border-radius:14px;padding:12px 15px;background:var(--card);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:62px}
.fx-card .lbl{font-size:13.5px;font-weight:700;color:var(--mut);flex:0 0 auto;white-space:nowrap}
.fx-card .val{font-size:26px;font-weight:800;letter-spacing:-.02em;text-align:right;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fg)}
.fx-card .unit{font-size:14px;font-weight:700;color:var(--mut);flex:0 0 auto}
.fx-card.input{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}
.fx-card.input .val{color:var(--brand-d)}
.fx-card.input .caret{display:inline-block;width:2px;height:24px;background:var(--brand-d);margin-left:2px;vertical-align:-4px;animation:fxcar 1s step-end infinite}
.fx-card.result .val{font-size:33px;color:var(--brand-d)}
@keyframes fxcar{50%{opacity:0}}
.fx-eq{text-align:center;color:var(--mut);font-size:12px;margin:1px 0}
.fx-rate{margin-top:14px;padding:12px 14px;border-radius:12px;background:var(--soft);text-align:center}
.fx-rate .big{font-size:15.5px;font-weight:800;color:var(--fg)}
.fx-rate .inv{display:block;font-size:12px;color:var(--mut);margin-top:3px}
.fx-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
.fx-chip{font-size:14px;background:var(--soft);color:var(--fg);border:1px solid var(--line);border-radius:999px;padding:7px 13px;font-weight:700;cursor:pointer}
.fx-chip:hover{border-color:var(--brand)}
.fx-chip.on{background:var(--brand);color:#fff;border-color:var(--brand)}
.fx-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.fx-key{font-size:22px;font-weight:700;padding:15px 0;border:1.5px solid var(--line);border-radius:12px;background:var(--card);color:var(--fg);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;transition:background .08s,transform .05s}
.fx-key:hover{background:var(--soft)}
.fx-key:active{background:var(--brand-soft);border-color:var(--brand);transform:scale(.97)}
.fx-install{display:none;width:100%;margin-top:12px;padding:13px;border:none;border-radius:12px;background:var(--brand);color:#fff;font-size:15px;font-weight:800;cursor:pointer}
.fx-install.show{display:block}
.fx-updated{margin-top:12px;font-size:12px;color:var(--mut);text-align:center}
.fx-updated.stale{color:var(--warn)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.pcard{display:block;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:var(--shadow);padding:14px 15px;transition:transform .12s,border-color .12s}
.pcard:hover{border-color:var(--brand);transform:translateY(-2px);text-decoration:none}
.pcard h3{margin:0 0 3px;font-size:15px;color:var(--fg)}
.pcard p{margin:0;font-size:12.5px;color:var(--mut)}
.prose{font-size:14.5px;color:#37444a;line-height:1.75}
.prose h2{font-size:17px;margin:24px 0 8px;color:var(--fg)}
.prose p{margin:10px 0}
.faq details{border:1px solid var(--line);border-radius:12px;background:var(--card);padding:0 16px;margin:10px 0;box-shadow:var(--shadow)}
.faq summary{cursor:pointer;font-weight:700;padding:15px 0;font-size:14.5px;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";float:right;color:var(--mut);font-weight:800;font-size:18px}
.faq details[open] summary::after{content:"−"}
.faq p{margin:0 0 15px;font-size:14px;color:#3f4b51;line-height:1.6}
.adslot{margin:18px 0;text-align:center;min-height:1px}
/* 앱(홈 화면 설치=standalone)으로 열면 웹 전용 콘텐츠 숨김 → 계산기만 노출 */
@media (display-mode:standalone){.web-only{display:none!important}}
html.standalone .web-only{display:none!important}
.fx-updated .fx-sub{display:block;font-size:11.5px;color:var(--mut);margin-top:3px}
/* 하단 고정 배너(계속 떠있음, 앱 사용 중에도 노출) — adfitUnit 설정 시에만 */
.stickyad{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;justify-content:center;align-items:center;min-height:56px;padding:6px 8px calc(6px + env(safe-area-inset-bottom));background:var(--card);border-top:1px solid var(--line);box-shadow:0 -2px 12px rgba(10,40,45,.07)}
body.hasad{padding-bottom:calc(66px + env(safe-area-inset-bottom))}
.installhint{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:616px;margin:0 auto;background:var(--fg);color:#fff;border-radius:12px;padding:12px 14px;font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,.28);display:none;z-index:80;align-items:center;gap:10px}
.installhint.show{display:flex}
.installhint b{color:#fff}
.installhint .x{margin-left:auto;background:rgba(255,255,255,.18);border:none;color:#fff;border-radius:8px;width:28px;height:28px;font-size:16px;cursor:pointer;flex:0 0 auto}
footer{border-top:1px solid var(--line);margin-top:36px;padding:24px 0 40px;color:var(--mut);font-size:12.5px;background:var(--soft)}
footer a{color:var(--mut)}footer .fbrand{font-weight:800;color:var(--fg);font-size:15px}
.disc{margin-top:8px;color:var(--mut)}
h1,h2,h3{letter-spacing:-.01em}
@media (max-width:560px){.hero h1{font-size:22px}.ptitle{font-size:20px}.fx-cur{flex-basis:42%}.fx-amt{font-size:20px}.grid2{grid-template-columns:1fr}}
@media (prefers-color-scheme:dark){
 :root{--bg:#0e1618;--fg:#e6eef0;--mut:#94a3a8;--line:#222f33;--soft:#152023;--card:#141e21;--brand:#2aa3b8;--brand-d:#4dc0d4;--brand-soft:#12312f;--shadow:0 1px 2px rgba(0,0,0,.4),0 6px 20px rgba(0,0,0,.4)}
 header.top{background:rgba(14,22,24,.9)}
 .notice{background:#231f10;border-color:#3d3413;color:#d8c78a}
 .fx-off{background:#2a1a12;border-color:#5a3320;color:#e6a583}
 .prose,.faq p,.lead{color:#c2ccce}
}
`;

// ---------- 광고/분석 스니펫 (설정 시에만 삽입) ----------
function adfitHead() {
  return SITE.adfitUnit ? `<script async src="https://t1.daumcdn.net/kas/static/ba.min.js"></script>` : "";
}
export function adfitSlot() {
  if (!SITE.adfitUnit) return "";
  return `<div class="adslot"><ins class="kakao_ad_area" style="display:none" data-ad-unit="${escapeHtml(SITE.adfitUnit)}" data-ad-width="320" data-ad-height="100"></ins></div>`;
}
// 하단 고정 배너(계속 떠있는 앵커형) — adfitUnit 설정 시에만 렌더
export function stickyAd() {
  if (!SITE.adfitUnit) return "";
  return `<div class="stickyad" role="complementary" aria-label="광고"><ins class="kakao_ad_area" style="display:none" data-ad-unit="${escapeHtml(SITE.adfitUnit)}" data-ad-width="320" data-ad-height="50"></ins></div>`;
}
function gaHead() {
  if (!SITE.gaId) return "";
  const id = escapeHtml(SITE.gaId);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}')</script>`;
}

// ---------- 공통 셸 (PWA head 포함) ----------
function shell({ title, desc, canonical, body, jsonld = "", boot = "" }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="icon" href="/icon.svg">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="${escapeHtml(SITE.themeColor || "#0b7285")}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${escapeHtml(SITE.short_name || SITE.name)}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${SITE.googleVerification ? `<meta name="google-site-verification" content="${escapeHtml(SITE.googleVerification)}">` : ""}
${SITE.naverVerification ? `<meta name="naver-site-verification" content="${escapeHtml(SITE.naverVerification)}">` : ""}
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(SITE.name)}">
<meta name="robots" content="index,follow">
<style>${CSS}</style>
${adfitHead()}
${gaHead()}
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ""}
</head>
<body${SITE.adfitUnit ? ' class="hasad"' : ""}>
<header class="top"><div class="bar">
  <a class="logo" href="/"><span class="m">⇄</span> <span>환율<b>계산기</b></span></a>
  <nav class="gnb">
    <a href="/pair/usd-krw.html">달러</a>
    <a href="/pair/jpy-krw.html">엔화</a>
    <a href="/about.html">소개</a>
  </nav>
</div></header>
<main>
${body}
</main>
<footer><div class="wrap">
  <p class="fbrand web-only">${escapeHtml(SITE.name)}</p>
  <p class="web-only">${escapeHtml(SITE.tagline)} · 실시간 자동 갱신 · 오프라인 지원 PWA.</p>
  <p class="disc web-only">표시 환율은 <b>참고용 기준 환율</b>이며, 실제 환전 시 은행·카드사의 스프레드와 수수료로 금액이 달라집니다. 본 서비스는 투자·환전 자문이 아닙니다.</p>
  <p class="disc web-only">환율 데이터 출처: ${escapeHtml(SITE.dataSource)}</p>
  <p><a href="/about.html">소개</a> · <a href="/privacy.html">개인정보처리방침</a> · <a href="/terms.html">이용약관·면책</a> · <a href="/disclosure.html">데이터·고지</a> · <a href="/contact.html">문의</a></p>
  <p>© ${escapeHtml(SITE.name)} · 정보 제공 목적</p>
</div></footer>
${stickyAd()}
${boot}
</body>
</html>`;
}

// ---------- 환율 참고용 고지 박스 ----------
function disclaimerNotice() {
  return `<div class="notice">💱 표시 환율은 국제 기준 환율(참고용)입니다. 실제 은행·카드 환전 시 스프레드·수수료로 금액이 달라질 수 있습니다.</div>`;
}

// ---------- 계산기 위젯 마크업 ----------
// foreign: 외화 코드(KRW의 반대편), dir: "toKRW"(외화→원, 기본) | "toForeign"(원→외화)
function calcWidget(foreign = "USD", dir = "toKRW") {
  return `<div class="fx" data-foreign="${escapeHtml(foreign)}" data-dir="${escapeHtml(dir)}">
  <div class="fx-off" id="fxOff" hidden></div>
  <div class="fx-head">
    <div class="fx-sel"><select id="fxCur" aria-label="통화 선택"></select></div>
    <button class="fx-swap" id="fxSwap" type="button" aria-label="방향 바꾸기">⇅</button>
  </div>
  <div class="fx-cards">
    <div class="fx-card" id="fxCardF" role="button" tabindex="0" aria-label="외화 금액">
      <span class="lbl" id="fxLblF">USD</span><span class="val" id="fxValF">0</span><span class="unit" id="fxUnitF">$</span>
    </div>
    <div class="fx-eq">＝</div>
    <div class="fx-card" id="fxCardK" role="button" tabindex="0" aria-label="원화 금액">
      <span class="lbl">🇰🇷 원</span><span class="val" id="fxValK">0</span><span class="unit">₩</span>
    </div>
  </div>
  <div class="fx-rate" id="fxRate"><span class="big">환율 불러오는 중…</span></div>
  <div class="fx-chips" id="fxChips"></div>
  <div class="fx-keys" id="fxKeys"></div>
  <button class="fx-install" id="fxInstall" type="button">📲 홈 화면에 앱으로 추가</button>
  <div class="fx-updated" id="fxUpdated"></div>
</div>`;
}

// 페이지에 통화·환율 데이터를 심고 app.js 를 불러오는 부트 스크립트
function bootScript(currencies, rates) {
  const cur = currencies.filter((c) => !c.disabled);
  return `<script>window.__CUR__=${JSON.stringify(cur)};window.__RATES__=${JSON.stringify(rates)};window.__SITE__=${JSON.stringify({ ratesApi: SITE.ratesApi, name: SITE.name })};</script>
<div class="installhint" id="fxHint"><span>📲 <b>공유</b> → <b>홈 화면에 추가</b>로 앱처럼 설치해 쓰세요</span><button class="x" id="fxHintX" type="button" aria-label="닫기">×</button></div>
<script src="/app.js" defer></script>`;
}

// ---------- 홈 ----------
export function renderIndex(currencies, rates, today) {
  const popularPairs = ["usd-krw", "jpy-krw", "eur-krw", "cny-krw"];
  const pairCards = [
    ["/pair/usd-krw.html", "달러 환율", "USD → KRW"],
    ["/pair/jpy-krw.html", "엔화 환율", "JPY → KRW"],
    ["/pair/eur-krw.html", "유로 환율", "EUR → KRW"],
    ["/pair/cny-krw.html", "위안화 환율", "CNY → KRW"],
    ["/pair/thb-krw.html", "바트 환율", "THB → KRW"],
    ["/pair/vnd-krw.html", "동 환율", "VND → KRW"],
  ].map(([u, t, s]) => `<a class="pcard" href="${u}"><h3>${t}</h3><p>${s}</p></a>`).join("");

  const faq = [
    ["환율은 자동으로 업데이트되나요?", "네. 앱을 열 때마다 국제 기준 환율을 실시간으로 불러와 표시하며, 마지막으로 성공한 환율은 기기에 저장됩니다. 인터넷이 없으면 저장된 최근 환율로 계산하고 상단에 안내가 표시됩니다."],
    ["표시된 환율로 실제 환전이 되나요?", "표시 환율은 참고용 국제 기준 환율입니다. 실제 은행·카드 환전에는 스프레드(매매기준율과의 차이)와 수수료가 붙어 금액이 달라집니다. 예산을 가늠하는 용도로 사용하세요."],
    ["홈 화면에 앱처럼 설치할 수 있나요?", "아이폰은 사파리에서 공유 → '홈 화면에 추가', 안드로이드는 브라우저 메뉴의 '앱 설치/홈 화면에 추가'로 설치하면 전체화면 앱처럼 열립니다. 오프라인에서도 동작합니다."],
    ["어떤 통화를 지원하나요?", "미국 달러·일본 엔·유로·중국 위안·태국 바트·베트남 동 등 여행에서 자주 쓰는 통화를 기본 제공합니다. 통화 선택 메뉴에서 바꿀 수 있습니다."],
  ].map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("");

  const body = `
<section class="hero"><div class="wrap">
  <h1>여행 환율, 실시간으로 간편하게</h1>
  <p class="sub">통화를 고르고 금액을 입력하면 원화로 바로 환산. 자동 갱신 · 오프라인 지원.</p>
</div></section>
<div class="wrap">
  ${calcWidget("USD", "toKRW")}
  ${disclaimerNotice()}
  <div class="web-only">
    <div class="sec">통화별 환율 계산기<span class="sub">자주 찾는 통화를 바로 확인하세요</span></div>
    <div class="grid2">${pairCards}</div>

    <div class="prose">
      <h2>여행 환율, 이렇게 쓰세요</h2>
      <p>맨 위에서 <b>통화(달러·엔화 등)를 고르고</b>, 숫자판으로 <b>가격을 누르면</b> 바로 아래 <b>원화 금액</b>이 큰 글씨로 나옵니다. 국기 칩을 누르면 통화가 즉시 바뀌고, <b>⇅ 버튼</b>으로 "원 → 외화" 방향으로도 계산할 수 있습니다. 환율은 앱을 열 때마다 자동으로 최신화됩니다.</p>
    </div>

    <div class="sec">자주 묻는 질문</div>
    <div class="faq">${faq}</div>
  </div>
</div>`;

  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "WebApplication",
    name: SITE.name, url: SITE.baseUrl, applicationCategory: "FinanceApplication",
    operatingSystem: "Any", description: SITE.desc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  });
  return shell({
    title: `${SITE.name} — 실시간 여행 환율 계산기 (달러·엔화·유로)`,
    desc: SITE.desc, canonical: SITE.baseUrl + "/", body, jsonld,
    boot: bootScript(currencies, rates),
  });
}

// ---------- 통화쌍 SEO 랜딩 ----------
export function renderPair(pair, currencies, rates) {
  const faq = (pair.faq || []).map(([q, a]) =>
    `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("");
  const others = currencies.filter((c) => !c.disabled && c.popular && c.code !== "KRW" && c.code !== pair.from)
    .map((c) => `<a class="chip" href="/pair/${c.code.toLowerCase()}-krw.html">${c.flag} ${escapeHtml(c.ko)}</a>`).join("");

  const body = `<div class="wrap">
  <div class="crumb"><a href="/">홈</a> › 통화별 환율 › ${escapeHtml(pair.h1)}</div>
  <h1 class="ptitle">${escapeHtml(pair.h1)}</h1>
  <p class="lead">${escapeHtml(pair.desc)}</p>
  ${calcWidget(pair.from === "KRW" ? pair.to : pair.from, pair.from === "KRW" ? "toForeign" : "toKRW")}
  ${disclaimerNotice()}
  ${faq ? `<div class="sec">자주 묻는 질문</div><div class="faq">${faq}</div>` : ""}
  <div class="sec">다른 통화 환율</div>
  <div class="chiprow"><a class="chip" href="/">🏠 전체 계산기</a>${others}</div>
  <div class="prose"><p style="margin-top:20px;font-size:12.5px;color:var(--mut)">환율은 앱을 열 때마다 국제 기준 환율(${escapeHtml(SITE.dataSource)})로 자동 갱신됩니다. 실제 환전 금액은 은행·카드 수수료에 따라 달라질 수 있습니다.</p></div>
</div>`;

  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: (pair.faq || []).map(([q, a]) => ({
      "@type": "Question", name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  });
  return shell({
    title: pair.title, desc: pair.desc,
    canonical: `${SITE.baseUrl}/pair/${pair.slug}.html`, body,
    jsonld: (pair.faq && pair.faq.length) ? jsonld : "",
    boot: bootScript(currencies, rates),
  });
}

// ---------- 클라이언트 앱 (dist/app.js 로 생성) ----------
function APP() {
  var CUR = window.__CUR__ || [];
  var SITE = window.__SITE__ || {};
  var META = {}; CUR.forEach(function (c) { META[c.code] = c; });
  var state = { rates: {}, updated: "", stale: false };

  function $(id) { return document.getElementById(id); }

  // 홈 화면 설치 앱(standalone)이면 웹 전용 콘텐츠를 숨긴다(계산기만 노출)
  try {
    var isStandalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (("standalone" in navigator) && navigator.standalone);
    if (isStandalone) document.documentElement.classList.add("standalone");
  } catch (e) {}

  var root = document.querySelector(".fx");
  if (!root) return;

  // ---- 상태: foreign(외화), dir(방향), amt(입력 문자열) ----
  var qs = new URLSearchParams(location.search);
  var foreign = (qs.get("cur") || root.getAttribute("data-foreign") || "USD").toUpperCase();
  if (!META[foreign] || foreign === "KRW") foreign = "USD";
  var dir = (qs.get("dir") || root.getAttribute("data-dir") || "toKRW");
  if (dir !== "toForeign") dir = "toKRW";
  var amt = "1"; // 입력 중인 금액(문자열)

  function inputCur() { return dir === "toKRW" ? foreign : "KRW"; }
  function answerCur() { return dir === "toKRW" ? "KRW" : foreign; }

  // ---- 숫자 유틸 ----
  function decOf(code) { var m = META[code]; return m && typeof m.decimals === "number" ? m.decimals : 2; }
  function parseAmt(s) { var n = parseFloat(String(s || "").replace(/,/g, "")); return isFinite(n) ? n : 0; }
  function groupRaw(s) { // 입력 문자열을 천단위 콤마로(소수/말미 점 유지)
    if (s === "" || s == null) return "0";
    var p = String(s).split(".");
    var i = p[0].replace(/^0+(?=\d)/, "") || "0";
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return p.length > 1 ? i + "." + p[1] : (String(s).slice(-1) === "." ? i + "." : i);
  }
  function fmtNum(n, code) {
    if (!isFinite(n)) return "0";
    try { return n.toLocaleString("ko-KR", { minimumFractionDigits: 0, maximumFractionDigits: decOf(code) }); }
    catch (e) { return String(Math.round(n)); }
  }
  function fmtRate(n) {
    if (!isFinite(n)) return "-";
    var d = n >= 1000 ? 1 : n >= 100 ? 2 : n >= 1 ? 2 : n >= 0.01 ? 4 : 6;
    try { return n.toLocaleString("ko-KR", { minimumFractionDigits: 0, maximumFractionDigits: d }); }
    catch (e) { return String(n); }
  }
  function factor(from, to) {
    var rf = state.rates[from], rt = state.rates[to];
    if (!isFinite(rf) || !isFinite(rt) || rf <= 0) return NaN;
    return rt / rf; // rate[X] = 1 KRW 당 X 단위
  }

  // ---- 통화 셀렉트(외화만) ----
  (function fillSelect() {
    var sel = $("fxCur"); sel.innerHTML = "";
    CUR.forEach(function (c) {
      if (c.code === "KRW") return;
      var o = document.createElement("option");
      o.value = c.code; o.textContent = (c.flag ? c.flag + " " : "") + c.ko + " (" + c.code + ")";
      sel.appendChild(o);
    });
    sel.value = foreign;
  })();

  // ---- 팝업 통화 칩(외화) ----
  (function buildChips() {
    var box = $("fxChips"); box.innerHTML = "";
    CUR.filter(function (c) { return c.popular && c.code !== "KRW"; }).forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "fx-chip"; b.setAttribute("data-code", c.code);
      b.textContent = (c.flag ? c.flag + " " : "") + c.code;
      b.addEventListener("click", function () { setForeign(c.code); });
      box.appendChild(b);
    });
  })();

  // ---- 키패드 ----
  (function buildKeys() {
    var box = $("fxKeys");
    var keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "fx-key"; b.textContent = k;
      b.addEventListener("click", function () { press(k === "⌫" ? "back" : k); });
      box.appendChild(b);
    });
  })();

  function press(k) {
    if (k === "back") { amt = amt.length > 1 ? amt.slice(0, -1) : "0"; }
    else if (k === ".") { if (amt.indexOf(".") < 0) amt = (amt === "" ? "0" : amt) + "."; }
    else { // 숫자
      if (amt.replace(".", "").length >= 12) return;
      amt = (amt === "0") ? k : amt + k;
    }
    render();
  }

  // ---- 렌더 ----
  function render() {
    var iC = inputCur(), aC = answerCur();
    var f = factor(iC, aC);
    var answer = parseAmt(amt) * (isFinite(f) ? f : 0);

    var lblF = $("fxLblF"), unitF = $("fxUnitF");
    var mf = META[foreign];
    lblF.textContent = (mf && mf.flag ? mf.flag + " " : "") + foreign;
    unitF.textContent = mf && mf.symbol ? mf.symbol : foreign;

    // 외화/원 카드 값
    var fText = (iC === foreign) ? groupRaw(amt) : fmtNum(answer, foreign);
    var kText = (iC === "KRW") ? groupRaw(amt) : fmtNum(answer, "KRW");
    var cF = $("fxCardF"), cK = $("fxCardK");
    var caret = '<span class="caret"></span>';
    $("fxValF").innerHTML = fText + (iC === foreign ? caret : "");
    $("fxValK").innerHTML = kText + (iC === "KRW" ? caret : "");
    cF.classList.toggle("input", iC === foreign); cF.classList.toggle("result", aC === foreign);
    cK.classList.toggle("input", iC === "KRW"); cK.classList.toggle("result", aC === "KRW");

    // 헤드라인 환율(항상 1 외화 = ? 원)
    var one = factor(foreign, "KRW"), inv = factor("KRW", foreign);
    $("fxRate").innerHTML = '<span class="big">1 ' + foreign + " = " + fmtRate(one) + ' 원</span><span class="inv">1,000 원 = ' + fmtRate(inv * 1000) + " " + foreign + "</span>";

    // 칩 활성
    [].forEach.call($("fxChips").children, function (b) {
      b.classList.toggle("on", b.getAttribute("data-code") === foreign);
    });
    $("fxCur").value = foreign;
  }

  function renderRates() {
    var u = $("fxUpdated");
    var when = state.updated ? new Date(state.updated) : null;
    // 폰 시간대와 무관하게 항상 한국시간(KST)으로 표시 → 갱신 기준 시각과 일치
    var whenStr = when && !isNaN(when) ? when.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }) : "-";
    var line1 = (state.stale ? "⚠ 최근 저장된 환율 · " : "🟢 ") + whenStr + " 기준 (한국시간)";
    u.innerHTML = line1 + '<span class="fx-sub">환율은 매일 오전 9시경(한국시간) 자동 갱신됩니다</span>';
    u.classList.toggle("stale", state.stale);
    var off = $("fxOff");
    if (state.stale) { off.hidden = false; off.textContent = "실시간 환율을 불러오지 못해 최근 저장된 환율로 계산합니다."; }
    else { off.hidden = true; }
    render();
  }

  // ---- 방향/통화 전환 ----
  function carryAnswerToInput() {
    // 현재 정답값을 새 입력값으로 이어받는다(자연스러운 스왑)
    var iC = inputCur(), aC = answerCur();
    var f = factor(iC, aC);
    var answer = parseAmt(amt) * (isFinite(f) ? f : 0);
    var d = decOf(aC);
    amt = (Math.round(answer * Math.pow(10, d)) / Math.pow(10, d)).toString();
    if (amt === "0") amt = "0";
  }
  function swap() {
    carryAnswerToInput();
    dir = (dir === "toKRW") ? "toForeign" : "toKRW";
    var sw = $("fxSwap"); sw.classList.add("spin"); setTimeout(function () { sw.classList.remove("spin"); }, 200);
    render();
  }
  function setInputSide(side) { // side: "foreign" | "krw"
    var want = side === "krw" ? "toForeign" : "toKRW";
    if (want === dir) return;
    swap();
  }
  function setForeign(code) {
    if (!META[code] || code === "KRW") return;
    foreign = code; render();
  }

  $("fxSwap").addEventListener("click", swap);
  $("fxCardF").addEventListener("click", function () { setInputSide("foreign"); });
  $("fxCardK").addEventListener("click", function () { setInputSide("krw"); });
  $("fxCur").addEventListener("change", function () { setForeign($("fxCur").value); });

  // 물리 키보드(데스크톱)
  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key >= "0" && e.key <= "9") press(e.key);
    else if (e.key === ".") press(".");
    else if (e.key === "Backspace") { press("back"); }
    else if (e.key === "Enter") { swap(); }
    else return;
    e.preventDefault();
  });

  // ---- 환율 시드 & 실시간 fetch ----
  function normalize(obj) {
    var out = { rates: {}, updated: obj.updated || "", source: obj.source || "" };
    var r = obj.rates || {};
    for (var k in r) if (isFinite(r[k]) && r[k] > 0) out.rates[k] = r[k];
    out.rates.KRW = 1;
    return out;
  }
  function fresher(a, b) {
    if (!a) return b; if (!b) return a;
    return (Date.parse(b.updated) || 0) > (Date.parse(a.updated) || 0) ? b : a;
  }
  var bundled = window.__RATES__ ? normalize(window.__RATES__) : null;
  var stored = null;
  try { var s = localStorage.getItem("fx.rates"); if (s) stored = normalize(JSON.parse(s)); } catch (e) {}
  var seed = fresher(bundled, stored) || { rates: { KRW: 1 }, updated: "" };
  state.rates = seed.rates; state.updated = seed.updated;
  renderRates();

  (function pullLive() {
    if (!SITE.ratesApi) return;
    var done = false;
    var timer = setTimeout(function () { if (!done) { done = true; state.stale = true; renderRates(); } }, 6000);
    fetch(SITE.ratesApi, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status); return r.json();
    }).then(function (j) {
      if (done) return; done = true; clearTimeout(timer);
      var ok = (!j.result || j.result === "success") && (j.base_code || j.base) === "KRW" && j.rates;
      if (!ok) throw new Error("bad payload");
      var norm = normalize({
        rates: j.rates,
        updated: j.time_last_update_utc ? new Date(j.time_last_update_utc).toISOString() : new Date().toISOString(),
        source: "open.er-api.com",
      });
      var kept = { KRW: 1 };
      CUR.forEach(function (c) { if (isFinite(norm.rates[c.code]) && norm.rates[c.code] > 0) kept[c.code] = norm.rates[c.code]; });
      norm.rates = kept;
      state.rates = norm.rates; state.updated = norm.updated; state.stale = false;
      try { localStorage.setItem("fx.rates", JSON.stringify(norm)); } catch (e) {}
      renderRates();
    }).catch(function () {
      if (done) return; done = true; clearTimeout(timer);
      state.stale = true; renderRates();
    });
  })();

  // ---- 서비스워커 ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(function (reg) { reg.update(); }).catch(function () {});
    });
  }

  // ---- 설치: 안드로이드 원터치 버튼 + iOS 공유 힌트 ----
  var deferredPrompt = null;
  var installBtn = $("fxInstall");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferredPrompt = e;
    if (installBtn) installBtn.classList.add("show");
  });
  if (installBtn) installBtn.addEventListener("click", function () {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(function () { deferredPrompt = null; installBtn.classList.remove("show"); }); }
  });
  window.addEventListener("appinstalled", function () { if (installBtn) installBtn.classList.remove("show"); });
  try {
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = ("standalone" in navigator) && navigator.standalone;
    if (isIOS && !standalone && !localStorage.getItem("fx.hintDismissed")) {
      var hint = $("fxHint");
      if (hint) {
        hint.classList.add("show");
        var x = $("fxHintX");
        if (x) x.addEventListener("click", function () { hint.classList.remove("show"); try { localStorage.setItem("fx.hintDismissed", "1"); } catch (e) {} });
      }
    }
  } catch (e) {}

  render();
}
export function renderAppJs() {
  return "/* hwanyul-calc 클라이언트 (생성물 — scripts/lib.mjs 의 APP 을 수정) */\n(" + APP.toString() + ")();\n";
}

// ---------- manifest ----------
export function renderManifest() {
  return JSON.stringify({
    name: SITE.name + " — 여행 환율",
    short_name: SITE.short_name || SITE.name,
    description: SITE.desc,
    start_url: "/?src=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ko",
    theme_color: SITE.themeColor || "#0b7285",
    background_color: SITE.backgroundColor || "#ffffff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  }, null, 2);
}

// ---------- service worker ----------
export function renderServiceWorker(version, shellUrls) {
  const urls = JSON.stringify(shellUrls);
  return `/* hwanyul-calc service worker (생성물) */
var VERSION = ${JSON.stringify(version)};
var SHELL = 'shell-' + VERSION;
var RATES = 'rates-' + VERSION;
var SHELL_URLS = ${urls};

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(SHELL_URLS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k !== SHELL && k !== RATES) return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // 크로스오리진(라이브 환율 API 등): 캐시하지 않고 네트워크로 통과
  if (url.origin !== self.location.origin) return;

  // /rates.json : network-first (셸 캐시엔 넣지 않음)
  if (url.pathname === '/rates.json') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(RATES).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.open(RATES).then(function (c) { return c.match(req); }); })
    );
    return;
  }

  // 그 외 동일 출처(셸): cache-first + 백그라운드 갱신
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(SHELL).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
`;
}

// ---------- 정적 페이지 ----------
export function staticPages(today) {
  const email = escapeHtml(SITE.contactEmail);
  const P = (path, title, desc, heading, html) => ({
    path, title, desc,
    body: `<div class="wrap"><div class="crumb"><a href="/">홈</a> › ${escapeHtml(heading)}</div><h1 class="ptitle">${escapeHtml(heading)}</h1><div class="prose">${html}</div></div>`,
    canonical: SITE.baseUrl + path,
  });
  return [
    P("/about.html", `소개 | ${SITE.name}`, `${SITE.name} 소개`, "소개",
      `<p>${escapeHtml(SITE.name)}는 해외여행·해외직구 시 필요한 <b>환율 계산</b>을 빠르고 간편하게 할 수 있도록 만든 도구입니다. 통화를 고르고 금액을 입력하면 원화 기준으로 즉시 환산됩니다.</p>
       <p>환율은 앱을 열 때마다 국제 기준 환율을 실시간으로 불러와 갱신하며, 마지막으로 성공한 환율은 기기에 저장되어 <b>오프라인에서도</b> 계산할 수 있습니다. 홈 화면에 설치하면 앱처럼 전체화면으로 열립니다.</p>
       <p>표시 환율은 참고용이며 실제 환전 금액과 다를 수 있습니다. 자세한 내용은 <a href="/disclosure.html">데이터·고지</a>를 확인하세요.</p>`),
    P("/privacy.html", `개인정보처리방침 | ${SITE.name}`, "개인정보처리방침", "개인정보처리방침",
      `<p>${escapeHtml(SITE.name)}(이하 "사이트")는 회원가입·로그인 기능이 없으며 이용자로부터 이름·연락처 등 개인정보를 <b>직접 수집하지 않습니다.</b> 계산기의 입력값과 최근 환율은 이용자의 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다.</p>
       <h2>외부 연결 및 쿠키</h2>
       <p>실시간 환율을 표시하기 위해 환율 데이터 제공자(${escapeHtml(SITE.dataSource)})에 요청을 보냅니다. 광고·분석을 도입하는 경우 다음 서비스가 쿠키를 사용할 수 있습니다.</p>
       <p>• <b>카카오 애드핏</b>: 광고 노출·측정.<br>• <b>Google AdSense</b>(향후 도입 시): 관심 기반 광고(Google 광고 설정에서 해제 가능).<br>• <b>Google Analytics</b>(도입 시): 익명 방문 통계.</p>
       <p>브라우저 설정에서 쿠키·저장소를 거부할 수 있으며, 이 경우 일부 기능(오프라인 환율 저장 등)이 제한될 수 있습니다.</p>
       <h2>문의</h2><p><a href="mailto:${email}">${email}</a></p>
       <p>본 방침은 ${escapeHtml(today)}부터 적용됩니다.</p>`),
    P("/terms.html", `이용약관·면책 | ${SITE.name}`, "이용약관 및 면책", "이용약관·면책",
      `<p>본 사이트가 제공하는 환율·환산 결과 등 모든 정보는 <b>참고용</b>이며 정확성·완전성을 보장하지 않습니다.</p>
       <h2>환율 면책</h2>
       <p>표시 환율은 국제 기준(중간) 환율로, <b>실제 환전 시 은행·카드사의 매매기준율·스프레드·수수료</b>가 더해져 금액이 달라집니다. 본 서비스는 투자·환전·재정 자문이 아니며, 실제 거래 전에는 반드시 해당 금융기관의 고시 환율을 확인하시기 바랍니다.</p>
       <h2>데이터</h2>
       <p>환율 데이터는 ${escapeHtml(SITE.dataSource)}에서 제공되며, 제공자 사정에 따라 지연·오류·중단될 수 있습니다. 이 경우 마지막으로 저장된 환율이 표시될 수 있습니다.</p>
       <p>본 사이트는 정보 제공으로 인한 어떠한 직접·간접 손해에 대해서도 책임을 지지 않습니다.</p>`),
    P("/disclosure.html", `데이터·고지 | ${SITE.name}`, "환율 데이터 및 고지", "데이터·고지",
      `<p style="font-size:16px"><b>표시 환율은 참고용 국제 기준 환율이며, 실제 환전 금액은 은행·카드사의 스프레드와 수수료로 달라집니다.</b></p>
       <p>환율 데이터 출처: <b>${escapeHtml(SITE.dataSource)}</b>. 이 데이터는 매일 갱신되는 기준 환율로, 실시간 매매가와는 차이가 있을 수 있습니다.</p>
       <p>본 서비스는 특정 금융상품·환전처를 추천하거나 보증하지 않으며, 환전·투자에 대한 자문을 제공하지 않습니다. 실제 거래 조건은 이용자 본인이 해당 기관에서 확인해야 합니다.</p>
       <p>광고가 게재되는 경우, 광고는 콘텐츠와 명확히 구분되며 광고주의 지원은 환율 정보의 제공 방식에 영향을 주지 않습니다.</p>`),
    P("/contact.html", `문의 | ${SITE.name}`, "문의 및 제휴", "문의",
      `<p>기능 제안, 통화 추가 요청, 오류 신고, 제휴·광고 문의는 아래 이메일로 보내 주세요.</p>
       <p>📧 <a href="mailto:${email}">${email}</a></p>`),
  ];
}
export function renderStaticPage(p) {
  return shell({ title: p.title, desc: p.desc, canonical: p.canonical, body: p.body });
}

// ---------- 검색 인덱스 / 사이트맵 / robots ----------
export function searchIndex(pairs) {
  var idx = [{ t: "환율 계산기", u: "/", k: "환율 계산 여행 달러 엔화 유로" }];
  pairs.forEach(function (p) { idx.push({ t: p.h1, u: "/pair/" + p.slug + ".html", k: p.keywords || "" }); });
  return idx;
}
export function renderSitemap(paths, today) {
  const urls = paths.map((p) =>
    `  <url><loc>${SITE.baseUrl}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
export const ROBOTS = `User-agent: *
Allow: /
Sitemap: ${SITE.baseUrl}/sitemap.xml
`;
