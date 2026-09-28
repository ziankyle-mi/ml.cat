# Design Tokens: Dark Zen

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

## Rules
- No pure black. No pure white. No neon.
- Tier colors are muted. They show up only as a thin ring on portraits and a small label.
- No gradients. No glow. No card inside a card.
- Radius: 12px on panels, full circle on portraits.
- Spacing: use big gaps. When in doubt, add more space.
- Type: one serif for headings (Fraunces or Cormorant Garamond), one clean sans for body (Instrument Sans or Geist).
- Motion: 200 to 400ms fades and small slides. Ease out. Respect `prefers-reduced-motion`.
- Contrast: body text must pass WCAG AA on `ink`.
