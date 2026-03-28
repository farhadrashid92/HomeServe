/**
 * Generates icon-192.png and icon-512.png in public/icons/
 * using only Node.js built-ins — no npm packages needed.
 * Run: node generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// CRC32 lookup table for PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  const out = Buffer.alloc(4);
  out.writeUInt32BE((crc ^ 0xFFFFFFFF) >>> 0, 0);
  return out;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = crc32(Buffer.concat([t, data]));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR — 13 bytes: width, height, 8-bit depth, RGB color type
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  // Raw scanlines: filter byte (0) + RGB per pixel
  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0; // filter: None
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array(size).fill(row));
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// HomeServe brand color: #10b981 = RGB(16, 185, 129)
mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', makePNG(192, 16, 185, 129));
writeFileSync('public/icons/icon-512.png', makePNG(512, 16, 185, 129));
console.log('✅ Icons generated: public/icons/icon-192.png & icon-512.png');
