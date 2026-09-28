import fs from 'fs';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Referer: 'https://mobile-legends.fandom.com/',
};

async function main() {
  const res = await fetch(
    'https://mobile-legends.fandom.com/api.php?action=parse&page=Equipment&prop=text&format=json',
    { headers: HEADERS }
  );
  const data = await res.json();
  const html = data.parse.text['*'];

  const links = [...html.matchAll(/title="([^"]+)"[^>]*><img[^>]*src="([^"]+)"/g)].map((m) => ({
    title: m[1],
    src: m[2].split('/revision/')[0] + '/revision/latest',
  }));

  console.log('Found equipment count:', links.length);
  fs.writeFileSync('scripts/equipment_list.json', JSON.stringify(links, null, 2));

  // Check which of our target items exist
  const targets = [
    'Dominance Ice',
    'Sea Halberd',
    'Glowing Wand',
    'Demon Hunter Sword',
    'Wind of Nature',
    'Winter Crown',
    'Winter Truncheon',
    "Athena's Shield",
    'Athena Shield',
    'Radiant Armor',
    'Antique Cuirass',
    'Blade Armor',
    'Malefic Roar',
    'Divine Glaive',
  ];

  for (const t of targets) {
    const found = links.find((l) => l.title.toLowerCase().includes(t.toLowerCase()));
    console.log(`Target: ${t} -> ${found ? found.title + ' | ' + found.src : 'NOT FOUND'}`);
  }
}

main().catch(console.error);
