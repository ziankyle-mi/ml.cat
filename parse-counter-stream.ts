import fs from 'fs';

const text = fs.readFileSync('scripts/mlbb_gg_counter_streamed.txt', 'utf-8');

// Find occurrences of "counters" or similar
const idx = text.indexOf('counter');
console.log('Index of counter:', idx);

// Find any JSON objects with counter data
const matches = [...text.matchAll(/"([^"]*counter[^"]*)":/gi)].map(m => m[1]);
console.log('Keys with counter:', [...new Set(matches)]);

// Print a snippet around "counter"
if (idx !== -1) {
  console.log('Snippet around counter:', text.substring(idx - 50, idx + 400));
}
