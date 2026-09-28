# MLBB Meta Forge: Build Plan (v2)

A free Mobile Legends site with a daily meta tier list, a draft simulator, and counter picks for every hero. Real hero portraits everywhere. No backend. Dark, calm, zen look.

Give this file to your coding agent (Claude Code, Cursor, Antigravity). It builds one task at a time.

---

## 1. Features

Only these. Nothing else.

| # | Feature | What it does |
|---|---|---|
| 1 | **Daily meta tier list** | Tier rows (SS, S, A, B, C) that update every day. Free. |
| 2 | **Draft simulator** | Ban and pick in the 20-step order. Get top 5 suggestions. |
| 3 | **Hero pages** | One page per hero. Shows who counters them and who they counter. |
| 4 | **Counter this draft** | Enter the enemy's picks. Get the best heroes to answer them. |
| 5 | **Share link** | Copy a link to any draft or counter result. It opens the same state. |

Cut from the old plan: Hottest Build, Top Favorited, tier list drag-and-drop builder, PNG export. Add them later if you want.

---

## 2. Design: Dark Zen

### Feel

Quiet. Lots of empty space. Slow fades. Thin lines. The heroes are the only loud thing on the page. It should feel like a tea room, not a gaming dashboard.

### Design tokens

Put these in `tailwind.config.js` and `DESIGN.md`.

| Token | Value | Use |
|---|---|---|
| `ink` | `#0b0d0f` | Page background |
| `ink-raised` | `#111417` | Panels |
| `line` | `#22272c` | 1px borders |
| `paper` | `#e8e4da` | Main text (warm off-white) |
| `mist` | `#8b9096` | Secondary text |
| `tier-ss` | `#c9a35b` | Muted gold |
| `tier-s` | `#a8574f` | Clay red |
| `tier-a` | `#7d8f6a` | Moss green |
| `tier-b` | `#6b8199` | Slate blue |
| `tier-c` | `#7a7570` | Stone |

Rules:

- No pure black. No pure white. No neon.
- Tier colors are muted. They show up only as a thin ring on portraits and a small label.
- No gradients. No glow. No card inside a card.
- Radius: 12px on panels, full circle on portraits.
- Spacing: use big gaps. When in doubt, add more space.
- Type: one serif for headings (Fraunces or Cormorant Garamond), one clean sans for body (Instrument Sans or Geist). Self-host with Fontsource so the site stays static.
- Motion: 200 to 400ms fades and small slides. Ease out. Respect `prefers-reduced-motion`.
- Contrast: body text must pass WCAG AA on `ink`.

### Layout sketch

```
┌────────────────────────────────────────────────────────┐
│  Meta Forge         Tiers   Draft   Counter    [search]│
│                                                        │
│  Today's Meta                                          │
│  Updated 3h ago · next update in 21h 12m               │
│                                                        │
│  SS   (Hirara) (Marcel) (Hero) (Hero)                  │
│  ─────────────────────────────────────────             │
│  S    (Aulus) (Gloo) (Carmilla) (Obsidia) (Kaja) ...   │
│  ─────────────────────────────────────────             │
│  A    ...                                              │
│                                                        │
│  filter:  All   EXP   Gold   Mid   Jungle   Roam       │
└────────────────────────────────────────────────────────┘
```

Tier rows are open lines with a thin divider. No boxes. The label sits on the left in the serif font.

---

## 3. Use the Impeccable Plugin

Impeccable is a design skill for AI coding agents. It gives commands like `polish`, `audit`, `critique`, `quieter`, and `animate`. It also flags common AI design mistakes, like purple gradients and cards nested in cards.

### Install

Pick one. Run it from the project root.

```bash
npx impeccable install
```

Or, in Claude Code:

```
/plugin marketplace add pbakaus/impeccable
```

Then open `/plugin` and install Impeccable from the list. Reload your tool after.

### Set it up

Run this once before you build any UI:

```
/impeccable init
```

It writes `PRODUCT.md` and can write `DESIGN.md`. Paste this when it asks:

**PRODUCT.md**

```markdown
# Product
MLBB Meta Forge. A free site for Mobile Legends players.
Shows a daily meta tier list, a draft simulator, hero counter pages, and a
"counter this draft" tool.

# Audience
Ranked players, mostly on phones, often mid-match or right before a draft.
They want an answer in under 5 seconds.

# Voice
Short. Plain. Calm. No hype words. No gamer slang.

# Anti-references
Loud esports dashboards. Neon. Purple-to-blue gradients. Glow effects.
Cards inside cards. Rounded icon tiles above every heading.
```

**DESIGN.md**: paste the token table from section 2.

### When to run each command

| After | Run |
|---|---|
| Task 4 (home page) | `/impeccable critique tier list page` |
| Task 4 | `/impeccable quieter tier list page` if anything feels loud |
| Task 5, 6, 7 | `/impeccable polish <page>` |
| Task 6 (hero page) | `/impeccable harden hero page` for missing data and empty states |
| Task 8 | `/impeccable animate page transitions` (keep it subtle) |
| Task 9 | `/impeccable audit` on the whole site |

If a command changes colors or fonts away from section 2, undo it. The tokens in `DESIGN.md` win.

---

## 4. Hero Pictures (Required)

Every hero shows a real portrait.

### Files

```
public/heroes/
├── hirara.webp
├── marcel.webp
└── ...
public/heroes/_placeholder.webp
```

- WebP, 128x128, lowercase id as file name (`yu-zhong.webp`)

### Image script

`scripts/fetch-heroes.ts`, run with `npm run heroes:sync`:

1. Read `src/data/heroes.json`.
2. Download each hero's `sourceUrl`.
3. Crop to a square, resize to 128x128, save as WebP with `sharp`.
4. Print the heroes that failed. Use the placeholder for those.

You choose the source and put URLs in `heroes.json`. The agent must never guess a URL. Safe sources: the official Mobile Legends site, the Mobile Legends wiki on Fandom, or crops from your own game screenshots.

### `HeroAvatar` component

One component draws every portrait.

```typescript
interface HeroAvatarProps {
  hero: Hero;
  size?: 40 | 56 | 64 | 96 | 128;
  ringColor?: string;     // tier color
  showName?: boolean;
  disabled?: boolean;     // grayscale, used for banned or picked
  onClick?: () => void;
}
```

- Round `<img>`, `loading="lazy"`, fixed `width` and `height`.
- On error, swap to the placeholder.
- `alt={hero.name}` and a visible `focus-visible` ring.
- Ring is 2px so it stays quiet.

### Where portraits appear

| Screen | Size |
|---|---|
| Tier rows | 64 |
| Hero picker grid | 56 |
| Ban slots | 40 with a thin slash |
| Pick slots | 96 |
| Suggestion and counter results | 56 |
| Hero page header | 128 |

Footer line: "Fan project. Not affiliated with Moonton. All hero art belongs to its owners."

---

## 5. Daily Meta Update (Free)

No server. A scheduled GitHub Action does the work.

```
GitHub Actions cron (daily)
   → runs scripts/build-tiers.ts
   → writes src/data/tiers.json
   → commits to main
   → Vercel / Netlify / Cloudflare Pages redeploys
   → site reads the new file
```

### Workflow file `.github/workflows/daily-tiers.yml`

```yaml
name: daily-tiers
on:
  schedule:
    - cron: '0 16 * * *'   # 00:00 in the Philippines (UTC+8)
  workflow_dispatch:
permissions:
  contents: write
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx tsx scripts/build-tiers.ts
      - run: |
          git config user.name "meta-bot"
          git config user.email "meta-bot@users.noreply.github.com"
          git add src/data/tiers.json
          git diff --cached --quiet || git commit -m "chore: daily tier update"
          git push
```

### Data source

The game has no official public stats API. Plan for two stages:

1. **Stage 1, manual.** You edit `src/data/stats.json` (win, pick, ban rate per hero) whenever you like. The script builds tiers from it. The site ships fast.
2. **Stage 2, automatic.** Add a fetch step that pulls stats from a source you choose. Check that source's terms first. Expect it to break when they change their layout. Keep Stage 1 as the fallback.

### Tier scoring

```
score = 0.5 * winRate(z) + 0.3 * pickRate(z) + 0.2 * banRate(z)
```

`z` means the value normalized across all heroes. Cut the ranked scores into tiers by percentile:

| Tier | Top |
|---|---|
| SS | 3% |
| S | next 10% |
| A | next 25% |
| B | next 35% |
| C | rest |

Tune these numbers after you see real output.

### Countdown

`tiers.json` has `nextUpdateAt`. The home page shows "next update in 21h 12m". Put the math in `src/engine/countdown.ts` and test it.

---

## 6. Hero Pages

Route: `/hero/:id`

### Layout

```
[ portrait 128 ]   Hirara
                   Fighter · EXP · Physical
                   Today: S tier

Counter with
(Hero) (Hero) (Hero) (Hero) (Hero)
  each has a one-line reason

Weak against them
(Hero) (Hero) (Hero)

Strong against
(Hero) (Hero) (Hero)

Tags: heavy dash · burst
```

### Rules

- "Counter with" is the main block. It comes first. This is the reason people visit.
- Every counter shows a short reason, like "Anti-dash. Stops Hirara's engage."
- Tags link to a filtered hero grid.
- A search bar in the top nav jumps to any hero page.
- If a hero has no hand-written counters, build the list from tags (see section 7). Never show an empty page.

---

## 7. Counter Data

### Files

- `src/data/heroes.json`: hero info and tags
- `src/data/counters.json`: hand-written counters

```json
{
  "hirara": {
    "counteredBy": [
      { "id": "hero-a", "reason": "Anti-dash. Stops the engage." },
      { "id": "hero-b", "reason": "Hard CC punishes the dash." }
    ],
    "strongAgainst": ["hero-c", "hero-d"]
  }
}
```

Start with the 30 most played heroes. Fill the rest with tag matching.

### Tag fallback

Use the tags from the first plan.

```typescript
export type ArchetypeTag =
  | 'heavy_dash' | 'projectile_reliant' | 'regen_heavy' | 'dive'
  | 'burst' | 'hard_cc' | 'suppress' | 'anti_dash'
  | 'projectile_block' | 'anti_heal' | 'kiting';
```

Example: a hero with `heavy_dash` is countered by heroes with `anti_dash` or `hard_cc`.

---

## 8. Counter This Draft

Route: `/counter`

### Flow

1. You pick up to 5 enemy heroes with the hero grid.
2. Optional: mark your own picks and bans.
3. The page shows the top 5 heroes to pick next. Each has reason badges.
4. Optional: filter by lane, so you see only Gold or only EXP answers.
5. A "Copy link" button shares the result.

### Scoring

Reuse the recommender.

`FinalScore = S_lane + S_counter + S_hard + S_damage + S_meta`

1. **Lane**
   - Candidate's primary lane already taken by an ally: -50
   - Candidate fills a missing lane: +30
2. **Counter tags**
   - Candidate `counterTags` match an enemy's `tags`: +12 per match
   - Enemy `counterTags` match candidate's `tags`: -10 per match
3. **Hard counter**
   - Candidate is in the enemy's `counteredBy` list: +25
4. **Damage mix**
   - Ally team has 3 or more Physical heroes and candidate is Physical: -15
   - Ally team has 3 or more Physical heroes and candidate is Magic: +20
5. **Meta** (new)
   - Candidate is SS: +6, S: +4, A: +2

Return the top 5 with reasons. Each reason becomes a badge, like "+Anti-dash vs Hirara".

The draft simulator uses the same function, so you write it once.

---

## 9. Share Link

Use `lz-string` to compress state into the URL. No server.

| Page | Query | Holds |
|---|---|---|
| Draft | `?d=...` | Bans, picks, current step |
| Counter | `?c=...` | Enemy picks, own picks, lane filter |

Rules:

- Store hero ids only, not full hero objects. It keeps the link short.
- Use `HashRouter` so static hosting needs no rewrite rules.
- "Copy link" uses `navigator.clipboard`. Show a small "Copied" note that fades out.
- On load, read the query and restore state. If the data is bad, ignore it and show an empty page.
- Test: encode, decode, and check the result equals the input.

---

## 10. Tech Stack

- Vite, React, TypeScript
- Tailwind CSS with the tokens above, Lucide icons
- Zustand for state
- `react-router-dom` with `HashRouter`
- `lz-string` for share links
- `sharp` and `tsx` (dev only) for scripts
- Vitest for unit tests, Playwright for one end-to-end test
- GitHub Actions for the daily update
- Vercel, Netlify, or Cloudflare Pages for hosting

```
mlbb-meta-forge/
├── .agent/rules.md
├── .github/workflows/daily-tiers.yml
├── PRODUCT.md                 # from /impeccable init
├── DESIGN.md                  # tokens from section 2
├── scripts/
│   ├── fetch-heroes.ts
│   └── build-tiers.ts
├── public/heroes/
├── src/
│   ├── components/
│   │   ├── common/            # HeroAvatar, HeroGrid, SearchBox, CopyLinkButton
│   │   ├── tiers/             # TierRow, LaneFilter, Countdown
│   │   ├── draft/             # DraftBoard, TeamBans, TeamPicks
│   │   ├── hero/              # HeroHeader, CounterList, ReasonBadge
│   │   └── counter/           # EnemyPicker, ResultList
│   ├── data/
│   │   ├── heroes.json
│   │   ├── counters.json
│   │   ├── stats.json
│   │   └── tiers.json
│   ├── engine/
│   │   ├── draftMachine.ts
│   │   ├── recommender.ts
│   │   ├── tierBuilder.ts
│   │   ├── serializer.ts
│   │   └── countdown.ts
│   ├── store/
│   │   ├── draftStore.ts
│   │   └── counterStore.ts
│   ├── pages/                 # Home, Draft, Counter, HeroPage
│   └── types/                 # hero.ts, draft.ts, tier.ts
└── tests/
```

---

## 11. Data Contracts

### `src/types/hero.ts`

```typescript
export type HeroRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';
export type Lane = 'EXP' | 'Mid' | 'Roam' | 'Jungle' | 'Gold';
export type DamageType = 'Physical' | 'Magic' | 'True' | 'Hybrid';

export interface Hero {
  id: string;
  name: string;
  role: HeroRole;
  primaryLane: Lane;
  secondaryLane?: Lane;
  damageType: DamageType;
  tags: ArchetypeTag[];
  counterTags: ArchetypeTag[];
  icon: string;
  sourceUrl?: string;
}

export interface CounterEntry {
  id: string;
  reason: string;
}

export interface HeroCounters {
  counteredBy: CounterEntry[];
  strongAgainst: string[];
}
```

### `src/types/tier.ts`

```typescript
export type TierId = 'SS' | 'S' | 'A' | 'B' | 'C';

export interface TierRowData {
  id: TierId;
  color: string;
  heroIds: string[];
}

export interface TierSnapshot {
  updatedAt: string;
  nextUpdateAt: string;
  rows: TierRowData[];
}

export interface HeroStats {
  heroId: string;
  winRate: number;
  pickRate: number;
  banRate: number;
}
```

### `src/types/draft.ts`

```typescript
export type DraftPhase = 'BAN_PHASE_1' | 'PICK_PHASE_1' | 'BAN_PHASE_2' | 'PICK_PHASE_2' | 'COMPLETED';
export type Side = 'BLUE' | 'RED';
export type ActionType = 'BAN' | 'PICK';

export interface DraftStep {
  stepNumber: number;
  phase: DraftPhase;
  side: Side;
  type: ActionType;
  slotIndex: number;
}

export interface TeamDraft {
  bans: (Hero | null)[];
  picks: (Hero | null)[];
}
```

### Draft order

Put this array in `src/engine/draftMachine.ts`.

```typescript
export const DRAFT_ORDER: DraftStep[] = [
  { stepNumber: 1,  phase: 'BAN_PHASE_1',  side: 'BLUE', type: 'BAN',  slotIndex: 0 },
  { stepNumber: 2,  phase: 'BAN_PHASE_1',  side: 'RED',  type: 'BAN',  slotIndex: 0 },
  { stepNumber: 3,  phase: 'BAN_PHASE_1',  side: 'BLUE', type: 'BAN',  slotIndex: 1 },
  { stepNumber: 4,  phase: 'BAN_PHASE_1',  side: 'RED',  type: 'BAN',  slotIndex: 1 },
  { stepNumber: 5,  phase: 'BAN_PHASE_1',  side: 'BLUE', type: 'BAN',  slotIndex: 2 },
  { stepNumber: 6,  phase: 'BAN_PHASE_1',  side: 'RED',  type: 'BAN',  slotIndex: 2 },
  { stepNumber: 7,  phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 0 },
  { stepNumber: 8,  phase: 'PICK_PHASE_1', side: 'RED',  type: 'PICK', slotIndex: 0 },
  { stepNumber: 9,  phase: 'PICK_PHASE_1', side: 'RED',  type: 'PICK', slotIndex: 1 },
  { stepNumber: 10, phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 1 },
  { stepNumber: 11, phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 2 },
  { stepNumber: 12, phase: 'PICK_PHASE_1', side: 'RED',  type: 'PICK', slotIndex: 2 },
  { stepNumber: 13, phase: 'BAN_PHASE_2',  side: 'RED',  type: 'BAN',  slotIndex: 3 },
  { stepNumber: 14, phase: 'BAN_PHASE_2',  side: 'BLUE', type: 'BAN',  slotIndex: 3 },
  { stepNumber: 15, phase: 'BAN_PHASE_2',  side: 'RED',  type: 'BAN',  slotIndex: 4 },
  { stepNumber: 16, phase: 'BAN_PHASE_2',  side: 'BLUE', type: 'BAN',  slotIndex: 4 },
  { stepNumber: 17, phase: 'PICK_PHASE_2', side: 'RED',  type: 'PICK', slotIndex: 3 },
  { stepNumber: 18, phase: 'PICK_PHASE_2', side: 'BLUE', type: 'PICK', slotIndex: 3 },
  { stepNumber: 19, phase: 'PICK_PHASE_2', side: 'BLUE', type: 'PICK', slotIndex: 4 },
  { stepNumber: 20, phase: 'PICK_PHASE_2', side: 'RED',  type: 'PICK', slotIndex: 4 },
];
```

Check this against the current ranked and tournament rules before you ship. Bans and pick order change by mode.

---

## 12. Agent Rules (`.agent/rules.md`)

```markdown
# Agent Directives: MLBB Meta Forge

1. No `any`. Use types from `/src/types/*`. Use `unknown` only when parsing JSON.
2. `src/engine/*` has zero React imports. Pure functions only.
3. Change state only through Zustand actions.
4. Every hero portrait goes through `HeroAvatar`. No raw hero `<img>` elsewhere.
5. Never invent image URLs or hero data. Read from the JSON files or use the placeholder.
6. Read `PRODUCT.md` and `DESIGN.md` before writing any UI. Use only the design tokens.
7. No gradients, glow, neon, or nested cards. Keep motion under 400ms.
8. Always show `focus-visible` rings. Text must pass WCAG AA.
9. Run `npm test` after changing `src/engine/`. Run `npm run build` at the end of every task.
```

---

## 13. Task Roadmap

Run in order. Do not start a task until the one before it passes.

### Task 1: Scaffold, types, seed data, Impeccable

- Create the Vite + React + TS + Tailwind project.
- Install: `zustand lz-string lucide-react react-router-dom`
- Install dev: `sharp tsx vitest @playwright/test`
- Install Impeccable (section 3) and run `/impeccable init`.
- Add the design tokens to Tailwind. Write `DESIGN.md`.
- Write the type files.
- Create `heroes.json` with at least 25 heroes, including Hirara, Marcel, Aulus, Gloo, Carmilla, Obsidia, Kaja, Floryn.
- Create `counters.json` for at least 10 heroes, and `stats.json` with sample numbers.
- **Done when:** `npm run build` passes.

### Task 2: Hero images

- Write `scripts/fetch-heroes.ts` and the `heroes:sync` script.
- Add the placeholder.
- Build `HeroAvatar`.
- Make a temporary `/sandbox` page showing every hero in every size.
- **Done when:** Every seed hero shows a portrait or the placeholder. No broken image icons.

### Task 3: Engines (TDD)

- `tierBuilder.ts`: stats in, tiers out.
- `countdown.ts`
- `draftMachine.ts`: `nextStep`, `undoStep`, `isHeroUnavailable`.
- `recommender.ts`: the scoring in section 8.
- `serializer.ts`: compress and decompress for draft and counter state.
- Tests for edge cases: undo on step 1, banning a picked hero, empty teams, bad share link data.
- **Done when:** `npx vitest run` passes.

### Task 4: Home page and daily tier list

- `TierRow`, `LaneFilter`, `Countdown`.
- Read `tiers.json`. Show "updated" and "next update in".
- Build `scripts/build-tiers.ts` and the GitHub Action.
- Run `/impeccable critique` and `/impeccable quieter` on the page.
- **Done when:** The page matches the zen style at 1360px and 390px. A manual workflow run updates `tiers.json`.

### Task 5: Draft simulator

- `draftStore.ts` with `selectHero`, `undo`, `reset`, `suggestions`.
- `TeamBans`, `TeamPicks`, `HeroGrid` with role and lane filters and search.
- Banned and picked heroes are grayscale and disabled.
- Top 5 suggestions with reason badges.
- Run `/impeccable polish` on the page.
- **Done when:** Clicking heroes walks through all 20 steps in the right order.

### Task 6: Hero pages

- Route `/hero/:id`.
- `HeroHeader`, `CounterList`, `ReasonBadge`.
- Tag fallback when a hero has no hand-written counters.
- Search box in the nav.
- Run `/impeccable harden` and `/impeccable polish` on the page.
- **Done when:** Every hero in `heroes.json` opens a page with a full "Counter with" list.

### Task 7: Counter this draft

- Route `/counter`.
- `EnemyPicker` (up to 5), optional own picks and bans, lane filter.
- `ResultList` with the top 5 and reason badges.
- **Done when:** Picking 5 enemy heroes gives 5 sensible answers in under 200ms.

### Task 8: Share link

- `CopyLinkButton` on the draft and counter pages.
- Restore state from the query on load.
- Use `HashRouter`.
- Run `/impeccable animate` for the "Copied" note and page fades. Keep it subtle.
- **Done when:** A copied link opens the same state in a private window.

### Task 9: Polish and ship

- Run `/impeccable audit` on the whole site. Fix what it finds.
- Lighthouse pass on mobile.
- Add the fan-project footer.
- One Playwright test: open the counter page, pick 5 enemies, copy the link, reload from it.
- Deploy as a static site.

---

## 14. Definition of Done

- The tier list updates every day with no manual work, at $0.
- Every hero shows a real portrait or the placeholder.
- Every hero has a page with counters and reasons.
- Counter this draft returns 5 answers with reasons.
- The draft simulator follows the 20-step order.
- Share links restore state exactly.
- The design uses only the tokens in section 2. No gradients, glow, or nested cards.
- `npm run build` and `npx vitest run` both pass.
- Works at 390px wide with no sideways scroll.
