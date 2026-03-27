# IV Menu — Design Overrides

> **Route**: `/iv-menu`
> **Render Mode**: Client Component (Tabs/Accordion need state)
> **Pattern**: Product Showcase with Categorized Navigation
> **Overrides**: These rules take precedence over MASTER.md for the IV Menu page only

---

## Page Structure

```
1. Page Header              — Title + brief intro
2. Category Navigation      — Tab bar or filter chips
3. Treatment Grid           — Cards for each IV treatment
4. Comparison Note          — "Not sure which?" prompt
5. Booking CTA              — Full-width conversion strip
6. FAQ Accordion            — Common questions about IV therapy
```

---

## Section 1: Page Header

### Layout
- **Background**: Teal gradient (`gradient-hero`) — short banner, not full hero
- **Height**: `py-16 md:py-20`
- **Centered text**, max-w-3xl

### Content
```
OVERLINE: "IV TREATMENTS" (Inter 600, 12px, uppercase, gold)
HEADLINE: "Our IV Menu" (Cormorant Garamond 600, 44px, white)
SUBTEXT: "Premium IV therapy formulations, each tailored to specific
wellness goals. All treatments administered by a licensed nurse."
(Inter 400, 18px, white/80%)
```

---

## Section 2: Category Navigation

### Layout
- **Sticky** on scroll: `sticky top-[64px] z-10` (below main nav)
- **Background**: White with `shadow-sm` border-bottom
- **Horizontal scrollable** on mobile

### Tab Style
- Pill-shaped tabs: `rounded-full px-5 py-2`
- **Active**: `bg-medical-teal text-white`
- **Inactive**: `bg-transparent text-neutral-700 hover:bg-neutral-100`
- **Transition**: `all 200ms ease`

### Categories (suggested)
- All | Recovery | Wellness | Beauty | Custom

---

## Section 3: Treatment Cards

### Layout
- **Background**: `wellness-cream`
- **Grid**: `grid-cols-1 lg:grid-cols-2 gap-8`
- **Padding**: `py-12`

### Treatment Card (Detailed)

```
┌────────────────────────────────────────────────────┐
│                                                      │
│  [Treatment Icon]  RECOVERY (category badge)         │
│                                                      │
│  Hangover Recovery IV                                │  ← H3, Cormorant Garamond 600, 28px
│                                                      │
│  Our signature recovery drip replenishes fluids,     │  ← Inter 400, 16px, neutral-700
│  electrolytes, and essential vitamins to get you     │
│  back to feeling your best.                          │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ What's Included:                               │   │  ← Light teal background strip
│  │ • 1L Normal Saline  • B-Complex               │   │
│  │ • Anti-nausea       • Anti-inflammatory        │   │
│  │ • Electrolytes                                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ⏱ 30-45 minutes        💧 1000ml                   │  ← Meta row: Clock + Droplets icons
│                                                      │
│  $XXX                          [Book This IV]        │  ← Price left, CTA right
│                                                      │
└────────────────────────────────────────────────────┘
```

### Card Styling
- **Background**: White
- **Border**: 1px `neutral-300`
- **Radius**: `rounded-2xl`
- **Padding**: `p-6 md:p-8`
- **Hover**: `shadow-lg`, `border-medical-teal/30`
- **Transition**: `all 400ms cubic-bezier(0.4, 0, 0.2, 1)`

### Category Badge
- `rounded-full px-3 py-1`
- Background: `medical-teal/10`
- Text: `medical-teal`, Inter 600, 12px, uppercase

### Ingredients List
- Background: `medical-teal/5` (very subtle teal tint)
- Padding: `p-4 rounded-xl`
- Bullet points: teal colored dot
- Font: Inter 400, 14px

### Price Display
- Font: Inter 700, 28px, `neutral-900`
- Currency symbol slightly smaller: 20px
- If there's a "from" price: "From $XXX" in neutral-500

### Meta Row (duration, volume)
- Icons: 16px, `neutral-500`
- Text: Inter 400, 14px, `neutral-500`
- Layout: `flex gap-6`

### Popular Badge
- On 1-2 featured treatments only
- Gold pill: `bg-wellness-gold text-neutral-900 rounded-full px-3 py-1`
- Text: "Most Popular" — Inter 600, 12px
- Position: Top-right corner of card, `-mt-3 -mr-3` offset

---

## Section 4: Comparison / Decision Help

### Layout
- **Background**: White
- **Centered**, max-w-2xl
- **Padding**: `py-12`

### Content
```
HEADLINE: "Not Sure Which IV Is Right for You?" (Cormorant Garamond, 28px)
BODY: "Take our quick quiz to get a personalized recommendation,
or contact Nate directly for a consultation."
(Inter 400, 16px, neutral-700)

[Take the Quiz]       [WhatsApp Nate]
(teal secondary)      (outline + WhatsApp icon)
```

---

## Section 5: Booking CTA Strip

### Layout
- **Full-width**, teal gradient background
- **Flex row** on desktop, stack on mobile
- **Padding**: `py-8`

### Content
```
"Ready to book your treatment?"    [Book Now →]
(Inter 500, 18px, white)           (gold CTA button)
```

---

## Section 6: FAQ Accordion

### Layout
- **Background**: `wellness-cream`
- **Max-width**: `max-w-3xl`, centered
- **Padding**: `py-16`

### Accordion Styling
- **Trigger**: Inter 500, 16px, `neutral-900`, `py-4`
- **Trigger icon**: Chevron-down, 18px, teal, rotates on open
- **Content**: Inter 400, 16px, `neutral-700`, `pb-4`
- **Border**: Bottom border `neutral-300` between items
- **Animation**: Height transition, 300ms ease

### FAQ Topics
- What is IV therapy?
- Is it safe?
- How long does a treatment take?
- Where can you come?
- Do I need a prescription?
- What should I expect during treatment?

---

## IV Menu-Specific Rules

1. **Pricing must be visible** on every card — no "contact for pricing" hidden behind clicks
2. **Ingredients are a trust signal** — always show what's in each IV. Transparency builds medical trust
3. **Duration and volume** meta should be on every card — sets realistic expectations
4. **Category navigation must be accessible via keyboard** — tab through categories
5. **Data arrays should be extracted to a server component** — the tab/accordion UI is client, but the treatment data object can be defined server-side and passed as props
6. **No horizontal scrolling cards** — use a proper grid. Horizontal scroll hides content on medical product pages
7. **Add-ons section** (if applicable): Show as a separate "Enhancements" section below main treatments with smaller cards and "+$XX" pricing
