# PulseWire — Design System (Master)

> Product type: News / Media Platform (#66)  
> Style direction: Minimalism + Flat Design + Dark Mode (OLED) + Editorial Magazine Grid  
> Generated from `ui-ux-pro-max` skill reasoning.

---

## 1. Design Philosophy

**PulseWire** is a visually-driven, autonomous world-news dashboard. The UI is the product: every pixel should communicate freshness, trust, and clarity.

- **Content-first**: News imagery and headlines dominate; chrome is restrained.
- **Editorial hierarchy**: Large serif headlines, clean sans-serif metadata, generous whitespace.
- **Dual-mode ready**: Light mode feels like a premium morning paper; dark mode feels like a live newsroom monitor.
- **Motion with meaning**: Loaders, staggered card reveals, and live-pulse indicators express "always updating".
- **Accessible & ethical**: WCAG AA contrast, keyboard navigation, reduced-motion support, no clickbait dark patterns.

---

## 2. Design Tokens

### 2.1 Color Palette

Derived from `ui-ux-pro-max/data/colors.csv` row 66 (News/Media Platform).

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FEF2F2` | `#0A0A0A` | Page background |
| `--foreground` | `#450A0A` | `#F8FAFC` | Primary text |
| `--primary` | `#DC2626` | `#EF4444` | Breaking-news badges, active states, CTAs |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `--secondary` | `#EF4444` | `#B91C1C` | Secondary accents |
| `--accent` | `#1E40AF` | `#60A5FA` | Links, category chips, trust signals |
| `--card` | `#FFFFFF` | `#171717` | Card surfaces |
| `--card-foreground` | `#450A0A` | `#F1F5F9` | Text on cards |
| `--muted` | `#F0EDF1` | `#262626` | Muted backgrounds |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Metadata, timestamps |
| `--border` | `#FECACA` | `rgba(255,255,255,0.08)` | Dividers, card borders |
| `--ring` | `#DC2626` | `#EF4444` | Focus rings |

### 2.2 Typography

Font pairing: **News Editorial** (#14).

- **Display / Headlines**: `Newsreader`, serif — `font-weight: 600–700`, tight leading.
- **Body / UI**: `Roboto`, sans-serif — `font-weight: 400–500`, line-height 1.6.
- **Labels / Mono data**: `JetBrains Mono` (timestamps, live counters, source tags).

Scale:

| Level | Size | Weight | Line-Height | Use |
|-------|------|--------|-------------|-----|
| Hero | `clamp(2.5rem, 6vw, 5rem)` | 700 | 1.05 | Top-story headline |
| H1 | `2.25rem` | 700 | 1.1 | Section titles |
| H2 | `1.5rem` | 600 | 1.2 | Card headlines |
| H3 | `1.125rem` | 600 | 1.3 | Sub-headlines |
| Body | `1rem` | 400 | 1.6 | Article excerpts |
| Caption | `0.75rem` | 500 | 1.4 | Metadata, source, time |
| Label | `0.625rem` | 600 | 1 | Uppercase tags |

### 2.3 Spacing & Radius

- Base unit: `4px`.
- Section padding: `py-16 md:py-24`.
- Container max-width: `max-w-7xl`.
- Card radius: `1rem` (`rounded-2xl`).
- Button radius: `0.75rem` (`rounded-xl`).
- Input radius: `0.75rem`.
- Large gaps: `gap-6` / `gap-8`.

### 2.4 Elevation / Effects

- **Glassmorphism** (header, overlays):
  - `backdrop-filter: blur(16px) saturate(180%)`
  - `background: rgba(255,255,255,0.75)` / dark: `rgba(10,10,10,0.75)`
  - `border-bottom: 1px solid rgba(0,0,0,0.05)`
- **Shadows**:
  - Cards: `0 4px 24px rgba(0,0,0,0.06)`
  - Hover lift: `0 12px 40px rgba(0,0,0,0.12)`
- **Live pulse**: `box-shadow: 0 0 0 0 rgba(220,38,38,0.7)` + keyframe pulse.

### 2.5 Animation

- Micro-interactions: `150–250ms` `cubic-bezier(0.4, 0, 0.2, 1)`.
- Card entrance: staggered `translateY(20px) opacity(0)` → `translateY(0) opacity(1)`, `400ms`, stagger `50ms`.
- Reduced motion: disable transforms, fade-only.

---

## 3. Layout System

### 3.1 Page Structure

```
┌─────────────────────────────────────┐
│  Sticky Glass Header (nav + search) │
├─────────────────────────────────────┤
│  Breaking News Ticker               │
├─────────────────────────────────────┤
│  Hero: Top Story + Live Stats       │
├─────────────────────────────────────┤
│  Category Filter Bar                │
├─────────────────────────────────────┤
│  News Grid (masonry/editorial)      │
├─────────────────────────────────────┤
│  Trending / Analytics Panel         │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### 3.2 Grid

- Mobile: 1 column.
- Tablet (`md`): 2 columns.
- Desktop (`lg`): 3 columns, hero spans 2×2.
- Large (`xl`): 4 columns with featured tile spanning 2×2.

---

## 4. Components

### 4.1 Header

- Glassmorphism sticky header.
- Logo: "PulseWire" with live pulse dot.
- Search input with icon.
- Dark mode toggle.
- Settings/API-key trigger.

### 4.2 Breaking News Ticker

- Full-width band in primary red.
- Horizontally scrolling ticker text.
- "BREAKING" pill.

### 4.3 Hero Card

- Large featured image with aspect-video.
- Category pill, source, relative time.
- Serif headline overlay or below image.
- Hover: subtle scale + shadow lift.

### 4.4 News Card

- White/dark card, rounded-2xl.
- Thumbnail aspect-video.
- Category chip.
- Title (H3), excerpt 2-line clamp.
- Footer: source + time + bookmark icon.

### 4.5 Category Filter

- Horizontal scrollable pills.
- Active state: filled primary.
- Inactive: outlined, hover background.

### 4.6 Trending Panel

- Tag cloud sized by frequency.
- Mini bar chart of articles per category.
- "Last updated" timestamp.

### 4.7 States

- **Loading**: Skeleton cards with shimmer.
- **Empty**: Illustration + "No news found" + reset.
- **Error**: Alert card with retry button.
- **API setup**: Modal prompting NewsAPI key.

---

## 5. Interaction Rules

- Touch targets minimum `44×44px`.
- All interactive elements show visible focus rings.
- Buttons provide press feedback (`scale(0.98)`).
- Cards lift on hover (`translateY(-4px)` + shadow).
- Search debounced at `300ms`.
- Auto-refresh every `5 minutes` with visual "refreshing" badge.
- Reduced motion: disable parallax/stagger; keep opacity fades only.

---

## 6. Data Strategy

### 6.1 News Sources

1. **Primary**: NewsAPI.org `/v2/top-headlines` (requires API key).
2. **Fallback**: Curated demo dataset (realistic headlines, categories, images).

### 6.2 Categories

`business`, `entertainment`, `general`, `health`, `science`, `sports`, `technology`.

### 6.3 Auto-Update

- On mount: fetch news immediately.
- Interval: `300000ms` (5 min).
- Manual refresh button.
- Visual "Live" indicator pulses while active.

---

## 7. Accessibility

- Semantic HTML (`header`, `main`, `section`, `article`, `nav`).
- ARIA labels on icon buttons.
- Focus management on modal open/close.
- `prefers-reduced-motion` respected.
- Color not sole information carrier (icons + text).
- WCAG AA contrast for all text.

---

## 8. Anti-Patterns to Avoid

- No emoji as icons (use SVG/Lucide).
- No hover-only interactions.
- No autoplay video/audio.
- No layout shift on image load (aspect-ratio + skeletons).
- No arbitrary z-index chaos (scale: 10/20/30/40/50).
