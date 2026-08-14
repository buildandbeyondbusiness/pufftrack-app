import fs from 'fs';
import sharp from 'sharp';

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#000000"/>
  <circle cx="256" cy="256" r="210" fill="#0a84ff" opacity="0.2"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="280">💨</text>
</svg>
`);

async function generate() {
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('PNG icons created successfully!');
}

generate().catch(console.error);
