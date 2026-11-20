import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
await mkdir(outDir, { recursive: true });

const RED = "#C51E2A";
const DOT = 18;
const grid = [
  "1100011",
  "1010101",
  "1000001",
  "1011101",
  "1100011",
];

const dots = grid
  .flatMap((row, y) =>
    [...row].map((cell, x) =>
      cell === "1"
        ? `<rect x="${24 + x * DOT}" y="${24 + y * DOT}" width="${DOT - 4}" height="${DOT - 4}" rx="3" fill="white"/>`
        : "",
    ),
  )
  .join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${RED}"/>
  ${dots}
</svg>`;

const buf = Buffer.from(svg);
await writeFile(join(outDir, "icon.svg"), svg);
for (const size of [192, 512]) {
  await sharp(buf).resize(size, size).png().toFile(join(outDir, `icon-${size}.png`));
}

console.log("PWA icons written to public/icons/");
