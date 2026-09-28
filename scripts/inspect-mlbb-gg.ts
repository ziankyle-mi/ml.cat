import fs from 'fs';

async function main() {
  const res = await fetch('https://mlbb.gg/tierlist', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  console.log('Status /tierlist:', res.status);
  const text = await res.text();
  console.log('HTML Length:', text.length);

  // Check for __NEXT_DATA__
  const nextDataMatch = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    console.log('Found __NEXT_DATA__!');
    const json = JSON.parse(nextDataMatch[1]);
    console.log('Keys:', Object.keys(json));
    if (json.props) {
      console.log('Props keys:', Object.keys(json.props));
      if (json.props.pageProps) {
        console.log('pageProps keys:', Object.keys(json.props.pageProps));
      }
    }
    fs.writeFileSync('scripts/mlbb_gg_next_data.json', JSON.stringify(json, null, 2));
    return;
  }

  // Check for self.__next_f or react streaming
  const nextFMatches = [...text.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  console.log('self.__next_f matches:', nextFMatches.length);
  if (nextFMatches.length > 0) {
    fs.writeFileSync('scripts/mlbb_gg_raw_html.html', text);
    console.log('Wrote scripts/mlbb_gg_raw_html.html');
  }

  // Look for any API endpoints or JSON mentioned in the HTML
  const apiMatches = [...text.matchAll(/["'](\/(?:api|_next|static)[^"']+)["']/g)].map(m => m[1]);
  console.log('API / static matches:', [...new Set(apiMatches)].slice(0, 20));
}

main().catch(console.error);
