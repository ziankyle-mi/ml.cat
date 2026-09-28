import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import heroes from '../src/data/heroes.json';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/heroes');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const roleColors: Record<string, { bg: string; accent: string }> = {
  Fighter: { bg: '#2b1b17', accent: '#c9a35b' },
  Assassin: { bg: '#29141e', accent: '#d9534f' },
  Tank: { bg: '#17222b', accent: '#6b8199' },
  Mage: { bg: '#1e172e', accent: '#9b72cf' },
  Marksman: { bg: '#2c2615', accent: '#e0a96d' },
  Support: { bg: '#16281e', accent: '#7d8f6a' },
};

async function createAvatar(name: string, role: string, filename: string, isPlaceholder = false) {
  const colors = roleColors[role] || { bg: '#1c1f24', accent: '#8b9096' };
  const initials = isPlaceholder ? '?' : name.substring(0, 2).toUpperCase();
  const label = isPlaceholder ? 'HERO' : name.toUpperCase();

  const svg = `
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${colors.bg}" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" fill="#0b0d0f"/>
    <circle cx="64" cy="64" r="58" fill="url(#grad)" stroke="url(#ring)" stroke-width="2"/>
    <circle cx="64" cy="64" r="50" fill="none" stroke="#22272c" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="64" y="68" font-family="'Fraunces', serif, 'Georgia'" font-size="34" font-weight="600" fill="#e8e4da" text-anchor="middle" dominant-baseline="central">${initials}</text>
    <text x="64" y="96" font-family="'Instrument Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" fill="${colors.accent}" text-anchor="middle">${label}</text>
  </svg>
  `;

  const outputPath = path.join(OUTPUT_DIR, filename);
  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile(outputPath);
}

async function main() {
  console.log('Generating hero avatars...');
  
  // 1. Placeholder
  await createAvatar('Unknown', 'Tank', '_placeholder.webp', true);
  console.log('Created _placeholder.webp');

  // 2. All heroes
  for (const h of heroes) {
    const filename = `${h.id}.webp`;
    await createAvatar(h.name, h.role, filename);
  }
  console.log(`Generated ${heroes.length} hero portraits.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
