import fs from 'fs';

const text = fs.readFileSync('scripts/mlbb_gg_streamed.txt', 'utf-8');

// Look for back.mlbb.gg URLs
const backendUrls = [...text.matchAll(/https?:\/\/[a-zA-Z0-9.-]*mlbb\.gg[^\s"']*/g)].map(m => m[0]);
console.log('Unique mlbb.gg URLs in SSR payload:', [...new Set(backendUrls)].slice(0, 15));

// Find the tier list data structure
// Search for tier headers like "SS", "S", "A", "B", "C", "D"
const tierBlockRegex = /"tier":"(SS|S|A|B|C|D)"|"title":"(SS|S|A|B|C|D)"|"(SS|S|A|B|C|D)","data":\[([\s\S]*?)\]\}/g;

// Let's find where the tier sections start
const idx = text.indexOf('"SS","data":[');
console.log('Index of SS data:', idx);

if (idx !== -1) {
  // Extract a chunk around it
  const chunk = text.substring(idx - 100, idx + 25000);
  fs.writeFileSync('scripts/tierlist_chunk.json', chunk);
  console.log('Wrote scripts/tierlist_chunk.json');
}
