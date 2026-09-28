import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ITEMS_DIR = path.resolve(process.cwd(), 'public/items');
const EQUIPMENT_FILE = path.resolve(process.cwd(), 'src/data/equipment.json');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Referer: 'https://mobile-legends.fandom.com/',
};

export interface Equipment {
  id: string;
  name: string;
  category: 'Physical' | 'Magic' | 'Defense';
  icon: string;
  tagline: string;
  passive: string;
  counterReason: string;
  bestAgainstTags: string[];
}

const COUNTER_ITEMS: {
  id: string;
  name: string;
  category: 'Physical' | 'Magic' | 'Defense';
  tagline: string;
  passive: string;
  counterReason: string;
  bestAgainstTags: string[];
  wikiFileName: string;
}[] = [
  {
    id: 'dominance-ice',
    name: 'Dominance Ice',
    category: 'Defense',
    tagline: 'Premier Anti-Heal & Attack Speed Slow',
    passive: 'Lifebane & Arctic Cold',
    counterReason: 'Reduces enemy HP regen & shields by 50% and reduces nearby enemy attack speed by 70%. Essential against sustain fighters and high attack-speed marksmen.',
    bestAgainstTags: ['regen_heavy', 'shield_heavy', 'high_aspd'],
    wikiFileName: 'Dominance_Ice.png',
  },
  {
    id: 'sea-halberd',
    name: 'Sea Halberd',
    category: 'Physical',
    tagline: 'Physical Anti-Heal & Extra HP Punish',
    passive: 'Lifebane & Punish',
    counterReason: 'Reduces enemy HP regen & shields by 50% on physical hit and grants up to 8% extra damage against high HP tank targets.',
    bestAgainstTags: ['regen_heavy', 'tank_heavy', 'shield_heavy'],
    wikiFileName: 'Sea_Halberd.png',
  },
  {
    id: 'glowing-wand',
    name: 'Glowing Wand',
    category: 'Magic',
    tagline: 'Magic Anti-Heal & Max HP Burn',
    passive: 'Lifebane & Scorch',
    counterReason: 'Applies 50% anti-heal reduction on magic skills and burns targets for 1.5% max HP per second. Melts high-HP tanks and sustain fighters.',
    bestAgainstTags: ['regen_heavy', 'tank_heavy'],
    wikiFileName: 'Glowing_Wand.png',
  },
  {
    id: 'demon-hunter-sword',
    name: 'Demon Hunter Sword',
    category: 'Physical',
    tagline: 'Colossal HP Shredder',
    passive: 'Devour',
    counterReason: 'Basic attacks deal 8% of target current HP as bonus physical damage. The absolute counter to meatshield tanks like Barats, Hylos, and Belerick.',
    bestAgainstTags: ['tank_heavy'],
    wikiFileName: 'Demon_Hunter_Sword.png',
  },
  {
    id: 'wind-of-nature',
    name: 'Wind of Nature',
    category: 'Physical',
    tagline: 'Physical Immunity Active',
    passive: 'Wind Chant (Active)',
    counterReason: 'Grants complete immunity to all physical damage for 2 seconds. Counteracts high-burst physical assassins and marksman ambushes.',
    bestAgainstTags: ['burst_physical', 'heavy_dash'],
    wikiFileName: 'Wind_of_Nature.png',
  },
  {
    id: 'winter-crown',
    name: 'Winter Crown',
    category: 'Magic',
    tagline: 'Invulnerability Stasis Freeze',
    passive: 'Frozen (Active)',
    counterReason: 'Freezes hero for 2 seconds, granting total immunity to all damage and crowd control. Dodge fatal dive combos from Eudora, Hayabusa, and Aldous.',
    bestAgainstTags: ['burst_magic', 'burst_physical', 'single_lock'],
    wikiFileName: 'Winter_Crown.png',
  },
  {
    id: 'athenas-shield',
    name: 'Athena Shield',
    category: 'Defense',
    tagline: 'Magic Burst Barrier',
    passive: 'Shield',
    counterReason: 'Reduces incoming magic damage by 25% for 3 seconds upon taking magic damage. Essential defense against one-shot combo mages.',
    bestAgainstTags: ['burst_magic'],
    wikiFileName: 'Athena%27s_Shield.png',
  },
  {
    id: 'radiant-armor',
    name: 'Radiant Armor',
    category: 'Defense',
    tagline: 'Continuous Magic Damage Negation',
    passive: 'Holy Blessing',
    counterReason: 'Increases magic defense each time taking magic damage, stacking up to 6 times. Drastically reduces sustained magic DPS from Chang e, Valir, and Kimmy.',
    bestAgainstTags: ['magic_dps', 'poke_magic'],
    wikiFileName: 'Radiant_Armor.png',
  },
  {
    id: 'antique-cuirass',
    name: 'Antique Cuirass',
    category: 'Defense',
    tagline: 'Skill-Based Physical Damage Dampener',
    passive: 'Deter',
    counterReason: 'Reduces the attacker Physical Attack by 6% when hit by a skill, stacking up to 18%. Heavy counter to skill casters like Fanny, Paquito, and Terizla.',
    bestAgainstTags: ['skill_physical', 'heavy_dash'],
    wikiFileName: 'Antique_Cuirass.png',
  },
  {
    id: 'blade-armor',
    name: 'Blade Armor',
    category: 'Defense',
    tagline: 'Crit Reduction & Damage Reflection',
    passive: 'Bladed Armor',
    counterReason: 'Reflects 20% of basic attack damage back to the attacker and reduces critical damage taken by 20%. The hard counter to basic-attack crit marksmen.',
    bestAgainstTags: ['high_aspd', 'crit_physical'],
    wikiFileName: 'Blade_Armor.png',
  },
  {
    id: 'malefic-roar',
    name: 'Malefic Roar',
    category: 'Physical',
    tagline: 'Heavy Armor Penetration Buster',
    passive: 'Armor Buster',
    counterReason: 'Grants high physical penetration that scales higher the more physical defense the enemy builds (up to 40% bonus penetration).',
    bestAgainstTags: ['tank_heavy', 'armor_stack'],
    wikiFileName: 'Malefic_Roar.png',
  },
  {
    id: 'divine-glaive',
    name: 'Divine Glaive',
    category: 'Magic',
    tagline: 'Magic Resistance Piercer',
    passive: 'Spellbreaker',
    counterReason: 'Grants magic penetration scaling with the enemy Magic Defense. Essential for mages against tanks building Athena Shield or Radiant Armor.',
    bestAgainstTags: ['tank_heavy', 'magic_resist_stack'],
    wikiFileName: 'Divine_Glaive.png',
  },
];

async function main() {
  if (!fs.existsSync(ITEMS_DIR)) {
    fs.mkdirSync(ITEMS_DIR, { recursive: true });
  }

  // Fetch Equipment page to get exact image URLs
  const res = await fetch(
    'https://mobile-legends.fandom.com/api.php?action=parse&page=Equipment&prop=text&format=json',
    { headers: HEADERS }
  );
  const data = await res.json();
  const html = data.parse.text['*'];

  const equipmentList: Equipment[] = [];

  for (const item of COUNTER_ITEMS) {
    const targetFile = path.join(ITEMS_DIR, `${item.id}.webp`);
    let downloaded = false;

    // Search for image in html matching wikiFileName or item name
    const regex = new RegExp(`src="([^"]*${item.wikiFileName.replace('%27', "['%27]")[0]}[^"]*)"`, 'i');
    const match = html.match(regex) || html.match(new RegExp(`src="([^"]*${item.name.replace(/\s+/g, '_')}[^"]*)"`, 'i'));

    if (match) {
      const rawUrl = match[1].split('/revision')[0];
      try {
        const imgRes = await fetch(rawUrl, { headers: HEADERS });
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          await sharp(buffer)
            .resize(96, 96, { fit: 'contain', background: { r: 17, g: 20, b: 23, alpha: 1 } })
            .webp({ quality: 90 })
            .toFile(targetFile);
          downloaded = true;
          console.log(`Downloaded icon for ${item.name}`);
        }
      } catch (e: any) {
        console.warn(`Failed to download ${item.name}: ${e.message}`);
      }
    }

    if (!downloaded && !fs.existsSync(targetFile)) {
      // Fallback clean svg-based badge if network fails
      const svg = `
        <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="16" fill="#111417" stroke="#22272c" stroke-width="2"/>
          <circle cx="48" cy="48" r="32" fill="#0b0d0f" stroke="${item.category === 'Physical' ? '#a8574f' : item.category === 'Magic' ? '#6b8199' : '#c9a35b'}" stroke-width="2"/>
          <text x="48" y="52" font-family="sans-serif" font-size="28" font-weight="bold" fill="#e8e4da" text-anchor="middle" dominant-baseline="middle">
            ${item.name.substring(0, 2).toUpperCase()}
          </text>
        </svg>
      `;
      await sharp(Buffer.from(svg)).webp().toFile(targetFile);
      console.log(`Created fallback icon for ${item.name}`);
    }

    equipmentList.push({
      id: item.id,
      name: item.name,
      category: item.category,
      icon: `/items/${item.id}.webp`,
      tagline: item.tagline,
      passive: item.passive,
      counterReason: item.counterReason,
      bestAgainstTags: item.bestAgainstTags,
    });
  }

  fs.writeFileSync(EQUIPMENT_FILE, JSON.stringify(equipmentList, null, 2), 'utf-8');
  console.log(`Saved ${equipmentList.length} counter items to ${EQUIPMENT_FILE}`);
}

main().catch(console.error);
