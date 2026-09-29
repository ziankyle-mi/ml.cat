import fs from 'fs';

async function main() {
  const res = await fetch('https://mlbb.gg/statistics', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  console.log('Status /statistics:', res.status);
  const text = await res.text();
  console.log('Length:', text.length);

  const matches = [...text.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  console.log('Total chunks:', matches.length);

  let combined = '';
  for (const m of matches) {
    try {
      combined += JSON.parse(`"${m[1]}"`);
    } catch (e) {
      combined += m[1];
    }
  }

  fs.writeFileSync('scripts/mlbb_gg_stats_streamed.txt', combined);
  console.log('Streamed length:', combined.length);

  // Look for backend API or statistics data structure
  const sampleData = combined.match(/"win_rate"[\s\S]{1,500}|"winRate"[\s\S]{1,500}|"pick_rate"[\s\S]{1,500}/g);
  if (sampleData) {
    console.log('Found statistics sample:', sampleData.slice(0, 3));
  } else {
    console.log('Searching for stats keywords in stream...');
    const numMatches = combined.match(/\d+\.\d+%/g);
    console.log('Percentages found:', numMatches?.slice(0, 10));
  }

  // Look for any backend endpoints called
  const urls = [...combined.matchAll(/https?:\/\/[a-zA-Z0-9.-]*mlbb\.gg[^\s"']*/g)].map(m => m[0]);
  console.log('Backend / API URLs in stats stream:', [...new Set(urls)].slice(0, 10));
}

main().catch(console.error);
