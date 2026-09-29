import fs from 'fs';

const text = fs.readFileSync('scripts/mlbb_gg_stats_streamed.txt', 'utf-8');

// Find the statistics array
// Search for `[{"hero_id":`
const marker = '[{"hero_id":';
const idx = text.indexOf(marker);

if (idx === -1) {
  console.error('Could not find stats array marker');
  process.exit(1);
}

// Extract the JSON array
let depth = 0;
let endIdx = -1;
for (let i = idx; i < text.length; i++) {
  if (text[i] === '[') depth++;
  else if (text[i] === ']') {
    depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of stats JSON array');
  process.exit(1);
}

const statsJson = text.substring(idx, endIdx + 1);
const statsArray = JSON.parse(statsJson);

fs.writeFileSync('scripts/mlbb_gg_all_stats.json', JSON.stringify(statsArray, null, 2));

console.log(`Successfully extracted ${statsArray.length} hero stats from mlbb.gg!`);
console.log('Sample hero #0:', statsArray[0]);

// Group by tier
const tierCounts: Record<string, number> = {};
for (const s of statsArray) {
  tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1;
}
console.log('Tier distribution in statistics:', tierCounts);
