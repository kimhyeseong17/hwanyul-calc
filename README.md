# 환율계산기 (hwanyul-calc)

여행객을 위한 **실시간 환율 계산기 PWA**. 홈 화면에 설치하면 앱처럼 열리고, 환율은 자동으로 갱신되며, 오프라인에서도 최근 환율로 계산할 수 있다. 의존성 0 정적 생성기 + Netlify(git push) 배포.

## 특징
- 통화 선택 + 금액 입력 → 원화 기준 즉시 환산 (양방향, 스왑, 인기 통화 칩)
- **자동 갱신**: 앱 열 때마다 라이브 환율 fetch(open.er-api.com, 키 불필요) + 매일 cron 스냅샷
- **설치형 PWA**: 아이폰·안드로이드 공통, 오프라인 동작, 전체화면
- 통화별 SEO 랜딩(달러·엔화·유로·위안·바트·동) + 광고 슬롯(설정 시)

## 개발
```bash
NODE="/c/Program Files/nodejs/node.exe"   # node가 PATH에 없을 때
"$NODE" scripts/gen-icons.mjs     # 아이콘 생성 (최초 1회)
"$NODE" scripts/fetch-rates.mjs   # 최신 환율 스냅샷
"$NODE" scripts/build.mjs         # dist/ 생성
"$NODE" scripts/serve.mjs         # http://localhost:4321
```
또는 `npm run dev` (build + serve).

## 배포
1. `git init` → 커밋 → GitHub 저장소 생성 → `git remote add origin …` → `git push -u origin main`
2. Netlify 에서 저장소 연결(빌드 명령 `node scripts/build.mjs`, 배포 폴더 `dist`는 netlify.toml 자동 적용)
3. 배포 URL 확인 후 `data/site.json` 의 `baseUrl` 을 실제 주소로 바꾸고 재빌드·재푸시
4. Google Search Console / 네이버 서치어드바이저에 `sitemap.xml` 제출
5. 이후 배포는 **`git push origin main`만** (CLI 직접 배포 금지)

환율 자동 갱신은 `.github/workflows/daily-rates.yml` 이 매일 09:00 KST 에 `data/rates.json` 을 갱신·커밋한다(시크릿 불필요).

> 표시 환율은 참고용 기준 환율이며, 실제 환전 금액은 은행·카드 수수료로 달라진다. 투자·환전 자문이 아니다.
