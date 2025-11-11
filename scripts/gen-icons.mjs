#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const pub = resolve(root, 'public');
const svgPath = resolve(pub, 'favicon.svg');

const outputs = [
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function main() {
  const svg = await readFile(svgPath);
  // Generate PNG variants
  await Promise.all(
    outputs.map(async ({ name, size }) => {
      const buf = await sharp(svg).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      await writeFile(resolve(pub, name), buf);
    })
  );

  // Generate ICO from 16, 32, 48 sized PNGs
  const icoSizes = [16, 32, 48];
  const pngs = await Promise.all(
    icoSizes.map((s) => sharp(svg).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer())
  );
  const icoBuf = await toIco(pngs);
  await writeFile(resolve(pub, 'favicon.ico'), icoBuf);

  console.log('Generated icons in /public');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
