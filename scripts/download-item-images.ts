import fs from 'fs';
import path from 'path';

interface ItemMapping {
  id: string;
  wikiFile: string;
}

const ITEMS: ItemMapping[] = [
  { id: 'dominance-ice', wikiFile: "File:Dominance_Ice.png" },
  { id: 'sea-halberd', wikiFile: "File:Sea_Halberd.png" },
  { id: 'glowing-wand', wikiFile: "File:Glowing_Wand.png" },
  { id: 'demon-hunter-sword', wikiFile: "File:Demon_Hunter_Sword.png" },
  { id: 'wind-of-nature', wikiFile: "File:Wind_of_Nature.png" },
  { id: 'winter-crown', wikiFile: "File:Winter_Crown.png" },
  { id: 'athenas-shield', wikiFile: "File:Athena's_Shield.png" },
  { id: 'radiant-armor', wikiFile: "File:Radiant_Armor.png" },
  { id: 'antique-cuirass', wikiFile: "File:Antique_Cuirass.png" },
  { id: 'blade-armor', wikiFile: "File:Blade_Armor.png" },
  { id: 'malefic-roar', wikiFile: "File:Malefic_Roar.png" },
  { id: 'divine-glaive', wikiFile: "File:Divine_Glaive.png" },
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Referer: 'https://mobile-legends.fandom.com/',
};

async function main() {
  const outDir = path.resolve('public/items');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const item of ITEMS) {
    try {
      const apiUrl = `https://mobile-legends.fandom.com/api.php?action=query&titles=${encodeURIComponent(
        item.wikiFile
      )}&prop=imageinfo&iiprop=url&format=json`;

      const apiRes = await fetch(apiUrl);
      const apiData = await apiRes.json();
      const pages = apiData?.query?.pages || {};
      const firstPage = Object.values(pages)[0] as any;
      const imgUrl = firstPage?.imageinfo?.[0]?.url;

      if (!imgUrl) {
        console.error(`No image URL found for ${item.id} (${item.wikiFile})`);
        continue;
      }

      console.log(`Downloading ${item.id} from ${imgUrl}...`);
      const imgRes = await fetch(imgUrl, { headers: HEADERS });
      if (!imgRes.ok) {
        console.error(`Failed to download ${item.id}: status ${imgRes.status}`);
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const destPath = path.join(outDir, `${item.id}.webp`);
      fs.writeFileSync(destPath, buffer);
      console.log(`Saved ${item.id}.webp (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Error processing ${item.id}:`, err);
    }
  }

  console.log('Finished downloading all equipment icons!');
}

main().catch(console.error);
