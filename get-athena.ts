async function main() {
  const res = await fetch('https://mobile-legends.fandom.com/api.php?action=parse&page=Athena%27s_Shield&prop=text&format=json');
  const data = await res.json();
  const html = data.parse.text['*'];
  const matches = [...html.matchAll(/https:\/\/static\.wikia\.nocookie\.net\/mobile-legends\/images\/[^\s"']+/g)].map(x => x[0]);
  console.log('Matches for Athena Shield:', matches.filter(m => m.includes('Athena') || m.includes('Shield') || m.includes('.png')).slice(0, 10));
}
main();
