import fs from 'fs';

const text = fs.readFileSync('scripts/mlbb_gg_streamed.txt', 'utf-8');

// Find `"tierListData":`
const marker = '"tierListData":';
const idx = text.indexOf(marker);

if (idx === -1) {
  console.error('Could not find tierListData marker');
  process.exit(1);
}

// Find the matching JSON object for tierListData
// It starts with `{`
const startIdx = text.indexOf('{', idx);
let depth = 0;
let endIdx = -1;

for (let i = startIdx; i < text.length; i++) {
  if (text[i] === '{') depth++;
  else if (text[i] === '}') {
    depth--;
    if (depth === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of JSON object');
  process.exit(1);
}

const jsonStr = text.substring(startIdx, endIdx + 1);
const tierListData = JSON.parse(jsonStr);

fs.writeFileSync('scripts/mlbb_gg_tierlist.json', JSON.stringify(tierListData, null, 2));

console.log('Successfully extracted tierListData!');
console.log('Updated at:', tierListData.updated_at);
console.log('Tiers found:', tierListData.data.map((t: any) => `${t.tier}: ${t.data.length} heroes`));

for (const t of tierListData.data) {
  console.log(`\n--- Tier ${t.tier} (${t.data.length}) ---`);
  const names = t.data.map((item: any) => `${item.hero.name} (${item.movement})`);
  console.log(names.join(', '));
}
