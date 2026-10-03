import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;

      // Gradient from Indigo (#4f46e5 -> rgb 79, 70, 229) to Emerald (#10b981 -> rgb 16, 185, 129)
      const t = (x + y) / (width + height);
      const r = Math.round(79 * (1 - t) + 16 * t);
      const g = Math.round(70 * (1 - t) + 185 * t);
      const b = Math.round(229 * (1 - t) + 129 * t);

      if (isMaskable) {
        // Full bleed for maskable
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Rounded rectangle / badge icon
        const cornerDist = Math.max(Math.abs(dx) - (width * 0.35), 0) ** 2 +
                           Math.max(Math.abs(dy) - (height * 0.35), 0) ** 2;
        const cornerR = (width * 0.12) ** 2;

        if (cornerDist <= cornerR) {
          rawData[pixelOffset] = r;
          rawData[pixelOffset + 1] = g;
          rawData[pixelOffset + 2] = b;
          rawData[pixelOffset + 3] = 255;
        } else {
          // Transparent outside badge
          rawData[pixelOffset] = 0;
          rawData[pixelOffset + 1] = 0;
          rawData[pixelOffset + 2] = 0;
          rawData[pixelOffset + 3] = 0;
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#4f46e5" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#grad)" filter="url(#shadow)" />
  <text x="256" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="160" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-4">PG</text>
  <text x="256" y="375" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="#a7f3d0" text-anchor="middle" letter-spacing="3">AUTOPILOT</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('✅ Generated public/icons/icon.svg');

// 2. Generate PNGs
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, false));
console.log('✅ Generated public/icons/icon-192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, false));
console.log('✅ Generated public/icons/icon-512.png');

fs.writeFileSync(path.join(iconsDir, 'icon-192-maskable.png'), createPng(192, 192, true));
console.log('✅ Generated public/icons/icon-192-maskable.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), createPng(512, 512, true));
console.log('✅ Generated public/icons/icon-512-maskable.png');

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180, false));
console.log('✅ Generated public/icons/apple-touch-icon.png');
