import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";

const file = process.argv[2];
const b = readFileSync(file);
let o = 8;
const chunks = [];
let w = 0;
let h = 0;
let color = 0;
while (o < b.length) {
  const len = b.readUInt32BE(o);
  const type = b.slice(o + 4, o + 8).toString();
  const data = b.slice(o + 8, o + 8 + len);
  if (type === "IHDR") {
    w = data.readUInt32BE(0);
    h = data.readUInt32BE(4);
    color = data[9];
  }
  if (type === "IDAT") chunks.push(data);
  if (type === "IEND") break;
  o += 12 + len;
}
if (color !== 6) {
  console.log({ file, w, h, color, note: "no rgba" });
  process.exit(0);
}
const raw = inflateSync(Buffer.concat(chunks));
const bpp = 4;
const stride = w * bpp;
let transparent = 0;
let blackOpaque = 0;
let other = 0;
const prev = Buffer.alloc(stride);
let p = 0;
const paeth = (a, b, c) => {
  const pp = a + b - c;
  const pa = Math.abs(pp - a);
  const pb = Math.abs(pp - b);
  const pc = Math.abs(pp - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
for (let y = 0; y < h; y += 1) {
  const filter = raw[p++];
  const row = Buffer.alloc(stride);
  for (let i = 0; i < stride; i += 1) {
    const x = raw[p++];
    const a = i >= bpp ? row[i - bpp] : 0;
    const up = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    let v = x;
    if (filter === 1) v = (x + a) & 255;
    else if (filter === 2) v = (x + up) & 255;
    else if (filter === 3) v = (x + Math.floor((a + up) / 2)) & 255;
    else if (filter === 4) v = (x + paeth(a, up, c)) & 255;
    row[i] = v;
  }
  for (let x = 0; x < w; x += 1) {
    const r = row[x * 4];
    const g = row[x * 4 + 1];
    const bl = row[x * 4 + 2];
    const a = row[x * 4 + 3];
    if (a < 16) transparent += 1;
    else if (r < 20 && g < 20 && bl < 20) blackOpaque += 1;
    else other += 1;
  }
  row.copy(prev);
}
const total = w * h;
console.log({ file, w, h, transparentPct: Math.round((transparent / total) * 100), blackPct: Math.round((blackOpaque / total) * 100), otherPct: Math.round((other / total) * 100) });
