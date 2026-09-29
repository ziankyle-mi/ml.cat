import fs from 'fs';

const html = fs.readFileSync('scripts/mlbb_gg_raw_html.html', 'utf-8');

// Find all occurrences of self.__next_f.push
const matches = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
console.log('Total chunks:', matches.length);

let combined = '';
for (const m of matches) {
  // unescape javascript string
  try {
    const unescaped = JSON.parse(`"${m[1]}"`);
    combined += unescaped;
  } catch (e) {
    combined += m[1];
  }
}

fs.writeFileSync('scripts/mlbb_gg_streamed.txt', combined);
console.log('Streamed text length:', combined.length);

// Look for hero names, tiers, and data
const ssMatches = combined.match(/"SS"[\s\S]{1,500}/g);
console.log('SS matches:', ssMatches?.slice(0, 3));

// Check if there is an embedded JSON or object containing heroes / tierlist
const heroMatches = [...combined.matchAll(/"name":"([^"]+)"/g)].map(m => m[1]);
console.log('Total hero name matches:', heroMatches.length, 'Unique:', [...new Set(heroMatches)].length);
if (heroMatches.length > 0) {
  console.log('Sample hero names:', [...new Set(heroMatches)].slice(0, 20));
}

// Search for keywords like "tier", "win_rate", "ban_rate", "rank"
const keywords = ['winRate', 'win_rate', 'banRate', 'ban_rate', 'pickRate', 'tier', 'grade', 'score'];
for (const kw of keywords) {
  const count = (combined.match(new RegExp(kw, 'gi')) || []).length;
  console.log(`Keyword "${kw}": ${count} matches`);
}
