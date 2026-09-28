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

  fs.writeFileSync('scripts/equipment_html.html', html.substring(0, 30000));

  // Find image urls
  const urls = [...html.matchAll(/https:\/\/static\.wikia\.nocookie\.net\/mobile-legends\/images\/[^\s"']+/g)].map(
    (m) => m[0]
  );
  console.log('Total static.wikia images found:', urls.length);
  console.log('Sample images:', urls.slice(0, 10));

  // Also look at link anchors or table rows
  const links = [...html.matchAll(/title="([^"]+)"[^>]*><img[^>]*src="([^"]+)"/g)].map((m) => ({
    title: m[1],
    src: m[2],
  }));
  console.log('Links with img count:', links.length);
  if (links.length > 0) {
    console.log('Sample links with img:', links.slice(0, 10));
  }
}

main().catch(console.error);
