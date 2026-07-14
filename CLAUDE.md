# CLAUDE.md — 환율계산기 (여행 환율 PWA)

AI가 이 프로젝트에서 일할 때 지키는 운영 매뉴얼. sbiz-jiwon·babyready와 동일한 "의존성 0 정적 생성기 + Netlify 자동배포" 패턴을 계승한다.

---

## 0. 목표 3줄

1. **목표:** 여행객이 네이버·구글 검색 없이 홈 화면에 설치한 앱으로 환율을 즉시 계산하게 하고, 광고로 수익을 만든다.
2. **핵심 가치:** 실시간 자동 갱신 + 오프라인 동작 + 설치형 PWA(아이폰·안드로이드 공통).
3. **결과물 방향:** 단순 계산기 하나가 아니라, 통화별 SEO 랜딩(달러·엔화·유로…)으로 검색 유입을 만들고 광고 슬롯으로 수익화.

---

## 1. ⚠️ 검수 규칙 (거짓 완료 보고 금지)

1. 결과물을 직접 열어 확인하고 증거 제시(생성 파일 경로·서버 200 응답·계산 수치·오프라인/서비스워커 동작).
2. 확인 못 한 것은 "못 했다"고 솔직히 보고. 추측으로 "완료" 금지.

---

## 2. 컴플라이언스 (법적 리스크 방지)

- **환율 참고용 고지**를 상시 노출한다: "표시 환율은 참고용 기준 환율이며, 실제 환전 시 은행·카드 스프레드·수수료로 금액이 달라집니다." (footer 상시 + 계산기 상단 notice + /disclosure.html)
- **투자·환전·재정 자문이 아님**을 명시한다. 특정 환전처·금융상품을 추천/보증하지 않는다.
- 개인정보를 직접 수집하지 않는다(계산 입력·최근 환율은 브라우저 localStorage 에만 저장). 광고 쿠키 고지는 /privacy.html.
- 환율 데이터 출처(open.er-api.com)를 표기한다.

---

## 3. 기술 스택 & 구조

| 영역 | 선택 |
|------|------|
| 정적 생성 | 의존성 0 순수 Node (`scripts/build.mjs`) |
| 환율 데이터 | `data/rates.json` 스냅샷(cron 갱신, 첫 페인트·오프라인 폴백) + 런타임 라이브 fetch(open.er-api.com) |
| PWA | `manifest.webmanifest` + `sw.js`(셸 cache-first / rates network-first / 라이브API 미캐시) + 아이콘 |
| 배포 | `git push origin main` 자동 배포(Netlify). CLI 직접 배포 금지 |

```
hwanyul-calc/
  scripts/  lib.mjs(렌더러·CSS·계산기·app.js/sw.js/manifest 생성) · build.mjs(생성)
            fetch-rates.mjs(환율 수집) · gen-icons.mjs(PNG 아이콘) · serve.mjs(로컬 확인)
  data/     site.json · currencies.json · pairs.json · rates.json(cron 갱신, 커밋)
  static/   icon.svg · icon-192.png · icon-512.png · apple-touch-icon.png (커밋)
  dist/     생성된 정적 사이트(배포 대상, git 무시)
  .github/workflows/daily-rates.yml  매일 09:00 KST 환율 갱신
```

- **자동 갱신 2중 구조:** ① 런타임 — 앱 열 때 브라우저가 라이브 API fetch, localStorage 캐시, 실패 시 오프라인 배너 + 마지막 저장값. ② cron — GitHub Actions가 매일 `data/rates.json` 갱신·커밋 → Netlify 재배포(첫 페인트/오프라인 폴백 최신화).
- **환율 규약:** `rates.json` 의 `rates[X]` = **1 KRW 당 X 단위**(open.er-api KRW 기준). 환산 factor = `rate[TO] / rate[FROM]`.

---

## 4. 명령어

```bash
# node가 PATH에 없을 수 있음 → 전체 경로 사용
NODE="/c/Program Files/nodejs/node.exe"

"$NODE" scripts/gen-icons.mjs    # static/ 아이콘 PNG 생성 (1회, 커밋)
"$NODE" scripts/fetch-rates.mjs  # 최신 환율 → data/rates.json (검증 통과 시에만 기록)
"$NODE" scripts/build.mjs        # data/*.json → dist/ 생성
"$NODE" scripts/serve.mjs        # 로컬 확인 (기본 4321)
```

---

## 5. 운영 메모

- 광고: 카카오 애드핏 승인 후 `data/site.json` 의 `adfitUnit` 에 광고단위 코드를 넣으면 슬롯이 삽입된다(빈 값이면 미삽입). `gaId`·verification 코드도 동일하게 빈 값=꺼짐.
- 통화 추가: `data/currencies.json` 에 항목 추가(→ fetch-rates 가 다음 갱신에 포함). SEO 랜딩 추가는 `data/pairs.json`.
- 배포 URL 확정 후 `data/site.json` 의 `baseUrl` 을 실제 주소로 바꾸고 재빌드·재푸시(canonical·sitemap·manifest 정합).

---

## 6. 작업 원칙 (요약)

우선순위: **정확성 > 검증 > 최소 변경 > 명확성 > 유지보수성**
- 파일·API·스키마가 있다고 가정 말고 먼저 읽어 확인.
- 요청 작업에만 국한, 무관한 리팩토링 금지.
- 막히면 멈추고 무엇이 막혔는지·무엇이 검증됐는지 보고.
- **검증 없이 "성공" 주장 금지.**
