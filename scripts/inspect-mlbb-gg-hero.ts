import fs from 'fs';

async function main() {
  const res = await fetch('https://mlbb.gg/heroes/99', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  console.log('Status /heroes/99:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);

  const matches = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  let combined = '';
  for (const m of matches) {
    try {
      combined += JSON.parse(`"${m[1]}"`);
    } catch {
      combined += m[1];
    }
  }

  fs.writeFileSync('scripts/mlbb_gg_hero99_streamed.txt', combined);
  console.log('Streamed length:', combined.length);

  // Search for counter or items
  const snippet = combined.match(/"counter"[\s\S]{1,500}|"counters"[\s\S]{1,500}|"items"[\s\S]{1,500}/g);
  console.log('Snippets:', snippet?.slice(0, 3));
}

main().catch(console.error);
