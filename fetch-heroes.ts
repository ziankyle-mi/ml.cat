import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import heroes from '../src/data/heroes.json';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/heroes');
const HEROES_JSON_PATH = path.resolve(process.cwd(), 'src/data/heroes.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://mobile-legends.fandom.com/',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
};

interface HeroDef {
  id: string;
  name: string;
  sourceUrl?: string;
  [key: string]: unknown;
}

async function scrapeWikiIconMap(): Promise<Record<string, string>> {
  console.log('Fetching official hero icons list from Mobile Legends Wiki...');
  const res = await fetch(
    'https://mobile-legends.fandom.com/api.php?action=parse&page=List_of_heroes&prop=text&format=json',
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`Fandom API error: ${res.statusText}`);
  const data = await res.json();
  const html = data.parse.text['*'];

  const rows = html.split('<tr');
  const heroMap: Record<string, string> = {};

  for (const row of rows) {
    const nameMatch = row.match(/<a\s+[^>]*href="\/wiki\/([^"#]+)"[^>]*title="([^"]+)"/);
    const imgMatch =
      row.match(/src="([^"]+Hero\d+-icon\.png[^"]*)"/) ||
      row.match(/data-src="([^"]+Hero\d+-icon\.png[^"]*)"/);

    if (nameMatch && imgMatch) {
      const heroName = nameMatch[2].trim().toLowerCase();
      const rawUrl = imgMatch[1].split('/revision')[0];
      heroMap[heroName] = rawUrl;
    }
  }

  return heroMap;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const wikiIcons = await scrapeWikiIconMap();
  console.log(`Found ${Object.keys(wikiIcons).length} hero icons on wiki.`);

  const updatedHeroes = [...(heroes as HeroDef[])];

  // Create clean placeholder with neutral dark game silhouette
  const placeholderSvg = `
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="#111417"/>
    <circle cx="64" cy="46" r="22" fill="#22272c" stroke="#2b3138" stroke-width="2"/>
    <path d="M24 116 C24 88, 40 76, 64 76 C88 76, 104 88, 104 116 Z" fill="#22272c" stroke="#2b3138" stroke-width="2"/>
    <circle cx="64" cy="64" r="62" fill="none" stroke="#22272c" stroke-width="2"/>
  </svg>
  `;
  await sharp(Buffer.from(placeholderSvg))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, '_placeholder.webp'));
  console.log('Saved clean fallback _placeholder.webp');

  let successCount = 0;

  for (let i = 0; i < updatedHeroes.length; i++) {
    const hero = updatedHeroes[i];
    const key = hero.name.toLowerCase();
    const iconUrl = wikiIcons[key] || hero.sourceUrl;

    if (!iconUrl) {
      console.warn(`No official icon found for ${hero.name}`);
      continue;
    }

    hero.sourceUrl = iconUrl;
    const targetFile = path.join(OUTPUT_DIR, `${hero.id}.webp`);

    try {
      const imgRes = await fetch(iconUrl, { headers: HEADERS });
      if (!imgRes.ok) {
        throw new Error(`Failed to download ${iconUrl}: HTTP ${imgRes.status}`);
      }
      const buffer = await imgRes.arrayBuffer();

      // Resize and convert to 128x128 WebP with crisp quality
      await sharp(Buffer.from(buffer))
        .resize(128, 128, { fit: 'cover', position: 'center' })
        .webp({ quality: 95 })
        .toFile(targetFile);

      console.log(`✓ [${i + 1}/${updatedHeroes.length}] Downloaded official portrait for ${hero.name} -> ${hero.id}.webp`);
      successCount++;
    } catch (err) {
      console.error(`Failed to process ${hero.name}:`, (err as Error).message);
    }
  }

  // Update heroes.json with verified source URLs
  fs.writeFileSync(HEROES_JSON_PATH, JSON.stringify(updatedHeroes, null, 2), 'utf-8');
  console.log(`Updated ${HEROES_JSON_PATH} with official source URLs.`);
  console.log(`Hero portraits sync complete! Successfully updated ${successCount}/${updatedHeroes.length} hero portraits.`);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
