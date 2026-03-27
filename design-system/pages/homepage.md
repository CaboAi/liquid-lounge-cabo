# Homepage — Design Overrides

> **Route**: `/`
> **Render Mode**: Server Component
> **Pattern**: Hero-Centric + Social Proof Cascade
> **Overrides**: These rules take precedence over MASTER.md for the homepage only

---

## Page Structure (Section Order)

The homepage follows a proven medical wellness conversion funnel:

```
1. Hero (above fold)         — Emotional hook + primary CTA
2. Trust Bar                 — Credentials + stats strip
3. Services Overview         — 3-4 service cards
4. How It Works              — 3-step process
5. IV Menu Teaser            — Featured 2-3 popular IVs
6. About / Why Nate          — Personal story + credentials
7. Reviews                   — Carousel with real testimonials
8. Final CTA                 — Booking prompt + WhatsApp
9. Footer                    — Nav, contact, legal
```

**DO NOT rearrange this order.** It follows the awareness → trust → consideration → action funnel.

---

## Section 1: Hero

### Layout
- **Full-width** hero with background image (Cabo scenery or treatment setting)
- **Teal gradient overlay**: `bg-gradient-to-r from-medical-teal/90 to-medical-teal-dark/70`
- **Two-column on desktop**: Text left (60%), image/visual right (40%)
- **Single column on mobile**: Text stacked above image
- **Height**: `min-h-[85vh]` on desktop, `min-h-[70vh]` on mobile
- **Padding**: `py-24` (96px)

### Content Hierarchy
```
OVERLINE: "Mobile IV Therapy in Los Cabos" (Inter 600, 12px, uppercase, gold)

HEADLINE: "Hydration & Wellness
Delivered to Your Door" (Cormorant Garamond 600, 56px desktop / 36px mobile, white)

SUBHEADLINE: "Licensed nurse-administered IV therapy at your hotel,
villa, or yacht. Recovery, energy, immunity — on your schedule."
(Inter 400, 18px, white/90%)

[Book Your IV]  [View IV Menu]
   (gold CTA)     (white outline ghost)
```

### CTA Placement
- **Primary CTA**: "Book Your IV" — gold button, left-aligned with text
- **Secondary CTA**: "View IV Menu" — white outline/ghost button next to primary
- **Spacing**: `gap-4` between buttons, `mt-8` from subheadline
- **Mobile**: Buttons stack full-width

### Hero Image Treatment
- If using background image: overlay with teal gradient, never raw
- If using split layout: image has `rounded-3xl` with soft shadow
- Consider CompactQuiz widget embedded in right column on desktop

---

## Section 2: Trust Bar

### Layout
- **Horizontal strip** below hero
- **Background**: White with `shadow-sm` bottom border
- **Content**: 3-4 trust stats in a row

### Content
```
[Shield icon]           [Award icon]          [Droplets icon]        [Star icon]
Licensed BSN RN         5+ Years              500+ Treatments        4.9★ Rating
                        Experience            Delivered              (XX Reviews)
```

- Icons: 32px, `medical-teal`
- Stats: Inter 700, 24px, `neutral-900`
- Labels: Inter 400, 14px, `neutral-500`
- Grid: `grid-cols-2 md:grid-cols-4 gap-6`
- Padding: `py-8`

---

## Section 3: Services Overview

### Layout
- **Background**: `wellness-cream`
- **Heading**: "Our Services" with overline "WHAT WE OFFER"
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Card Pattern
Each service card:
- Icon (48px, teal) or small image at top
- Service name (H3, Cormorant Garamond)
- 2-3 line description (Inter, neutral-700)
- "Learn More →" link (teal, with arrow)
- White background, `rounded-2xl`, `p-6`, hover lift

### Services to Feature
1. Hangover Recovery
2. Immune Boost
3. Energy & Wellness
4. Custom Formulations (if applicable)

---

## Section 4: How It Works

### Layout
- **Background**: White
- **3-step horizontal flow** on desktop, vertical stack on mobile
- Connected by a subtle line or dots between steps

### Content Pattern
```
Step 1                    Step 2                    Step 3
[Calendar icon]           [MapPin icon]             [Droplets icon]
Book Online               We Come to You            Feel Amazing
Choose your IV therapy    Nate arrives at your      Relax while your
and pick a time.          location with everything  custom IV delivers
                          needed.                   results in 30-45 min.
```

- Step numbers: Gold circle with white number, 40px
- Icons: 32px, teal
- Titles: Inter 600, 18px
- Descriptions: Inter 400, 16px, neutral-700

---

## Section 5: IV Menu Teaser

### Layout
- **Background**: `wellness-cream`
- **Show 2-3 most popular IVs** only — link to full menu
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

### Card Pattern (IV treatment card)
```
┌──────────────────────────┐
│  [Treatment Icon/Image]   │
│                           │
│  MOST POPULAR (badge)     │  ← gold badge, only on featured
│  Hangover Recovery        │  ← H3, Cormorant Garamond
│  Rehydrate and recover    │  ← Inter, neutral-700
│  with our signature...    │
│                           │
│  $XXX                     │  ← Inter 700, 28px, medical-teal
│  45 min treatment         │  ← Inter 400, 14px, neutral-500
│                           │
│  [Book This IV]           │  ← gold CTA button
└──────────────────────────┘
```

- "View Full Menu →" link below grid, centered

---

## Section 6: About / Why Nate

### Layout
- **Background**: White
- **Two-column**: Professional photo left, text right (reversed on mobile — text first)
- Photo: `rounded-2xl`, warm lighting, professional attire
- Text includes credential badges

### Content Pattern
```
OVERLINE: "YOUR NURSE"
HEADLINE: "Meet Nathan Brown, BSN RN"
BODY: Brief personal story — why Cabo, why IV therapy, credentials
BADGES: [Shield] Licensed RN  [Award] BSN Certified  [Heart] 500+ Treatments
[Learn More About Nate →]
```

---

## Section 7: Reviews Carousel

### Layout
- **Background**: `wellness-cream`
- **Carousel**: Embla, 1 card on mobile, 2 on tablet, 3 on desktop
- Navigation: Left/right arrows (teal, subtle), dot indicators below
- **Auto-play**: OFF (per anti-patterns)

### Review Card
```
┌──────────────────────────┐
│  ★★★★★                    │  ← gold stars
│                           │
│  "The hangover IV saved   │  ← Inter 400, neutral-900, italic
│   our fishing trip..."    │
│                           │
│  — Sarah M.               │  ← Inter 500, neutral-700
│  Hotel guest, Jan 2026    │  ← Inter 400, neutral-500, 14px
└──────────────────────────┘
```

- White card, `rounded-2xl`, `p-6`, `shadow-card`
- Quote marks: Decorative oversized `"` in teal/10% opacity as background element

---

## Section 8: Final CTA

### Layout
- **Full-width** with teal gradient background (`gradient-hero`)
- **Centered text**, max-w-2xl
- White text on teal

### Content
```
HEADLINE: "Ready to Feel Your Best?" (Cormorant Garamond, 36px, white)
SUBTEXT: "Book your mobile IV therapy session today." (Inter, 18px, white/80%)

[Book Now]          [WhatsApp Nate]
(gold CTA)          (white outline + WhatsApp icon)
```

---

## Homepage-Specific Rules

1. **CompactQuiz**: If embedded on homepage, place it in the hero right column on desktop or as a floating card below hero on mobile
2. **No pricing on homepage** unless in the IV Menu Teaser section — keep the focus on value first
3. **WhatsApp button**: Should appear in the final CTA and optionally as a floating action button (bottom-right, teal circle with WhatsApp icon)
4. **Above-fold content** must load without JavaScript — server-rendered hero text and image
5. **Social proof density**: At least 2 trust elements visible above the fold (trust bar counts)
