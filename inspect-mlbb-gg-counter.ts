import fs from 'fs';

async function main() {
  const res = await fetch('https://mlbb.gg/counter', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  console.log('Status /counter:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);

  const matches = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  console.log('Chunks:', matches.length);

  let combined = '';
  for (const m of matches) {
    try {
      combined += JSON.parse(`"${m[1]}"`);
    } catch {
      combined += m[1];
    }
  }

  fs.writeFileSync('scripts/mlbb_gg_counter_streamed.txt', combined);
  console.log('Streamed length:', combined.length);

  // Search for counter structure
  const counterKeywords = ['countered_by', 'counters', 'best_with', 'counter', 'items', 'equipments'];
  for (const kw of counterKeywords) {
    const count = (combined.match(new RegExp(kw, 'gi')) || []).length;
    console.log(`Keyword "${kw}": ${count} matches`);
  }
}

main().catch(console.error);
