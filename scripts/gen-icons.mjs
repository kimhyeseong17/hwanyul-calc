// PWA 아이콘 PNG 생성 (의존성 0 — node:zlib 만 사용)
// 사용: node scripts/gen-icons.mjs   → static/ 에 PNG 3종 생성(1회 실행 후 커밋)
// 디자인: 틸(brand) 풀블리드 정사각 + 흰색 환전(⇄) 마크. OS가 둥근 마스크를 씌우므로
//         투명 라운드 코너 없이 꽉 채운다(maskable & apple-touch-icon 호환).
import { deflateSync } from "node:zlib";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTDIR = join(ROOT, "static");

// brand teal #0b7285, 살짝 그라데이션 톤을 위해 상/하 두 색을 섞는다
const BG_TOP = [13, 132, 153];
const BG_BOT = [9, 92, 108];
const WHITE = [255, 255, 255];

// 정규화 좌표(0~1)에서 색을 결정. 마크는 중앙 ~60% 안전영역 안에만 그린다.
function colorAt(nx, ny) {
  // 배경(세로 그라데이션)
  const bg = [
    Math.round(BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * ny),
    Math.round(BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * ny),
    Math.round(BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * ny),
  ];
  if (mark(nx, ny)) return WHITE;
  return bg;
}

// ⇄ : 위 막대(오른쪽 화살표) + 아래 막대(왼쪽 화살표)
function mark(nx, ny) {
  // 위: 막대 [0.27,0.58] cy 0.42, 화살촉 tip 0.70
  if (bar(nx, ny, 0.27, 0.58, 0.42, 0.10)) return true;
  if (arrowRight(nx, ny, 0.70, 0.12, 0.15, 0.42)) return true;
  // 아래: 막대 [0.42,0.73] cy 0.58, 화살촉 tip 0.30
  if (bar(nx, ny, 0.42, 0.73, 0.58, 0.10)) return true;
  if (arrowLeft(nx, ny, 0.30, 0.12, 0.15, 0.58)) return true;
  return false;
}
function bar(nx, ny, x0, x1, cy, th) {
  return nx >= x0 && nx <= x1 && Math.abs(ny - cy) <= th / 2;
}
function arrowRight(nx, ny, xt, hw, hh, cy) {
  if (nx < xt - hw || nx > xt) return false;
  const frac = (xt - nx) / hw; // tip=0, base=1
  return Math.abs(ny - cy) <= hh * frac;
}
function arrowLeft(nx, ny, xt, hw, hh, cy) {
  if (nx > xt + hw || nx < xt) return false;
  const frac = (nx - xt) / hw;
  return Math.abs(ny - cy) <= hh * frac;
}

// size×size RGBA 버퍼 생성 (SS배 슈퍼샘플링 후 박스 평균 → 부드러운 에지)
function render(size, SS = 3) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const nx = (x + (sx + 0.5) / SS) / size;
          const ny = (y + (sy + 0.5) / SS) / size;
          const c = colorAt(nx, ny);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      buf[i] = Math.round(r / n);
      buf[i + 1] = Math.round(g / n);
      buf[i + 2] = Math.round(b / n);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

// ---- 최소 PNG 인코더 (RGBA, 8bit) ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  // 각 스캔라인 앞에 필터 바이트(0) 추가
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function main() {
  await mkdir(OUTDIR, { recursive: true });
  const jobs = [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["apple-touch-icon.png", 180],
  ];
  for (const [name, size] of jobs) {
    const png = encodePng(size, render(size));
    await writeFile(join(OUTDIR, name), png);
    console.log(`✅ static/${name} (${size}×${size}, ${png.length.toLocaleString()} bytes)`);
  }
}
main();
