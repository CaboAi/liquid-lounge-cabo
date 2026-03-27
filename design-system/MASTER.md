# Liquid Lounge IV — Master Design System

> **Industry**: Medical Wellness Spa / Mobile IV Therapy
> **Brand**: Liquid Lounge IV — Los Cabos, Mexico
> **Owner**: Nathan Brown BSN RN
> **Generated**: 2026-03-26
> **Status**: Active — source of truth for all phases

---

## 1. Brand Identity

### Brand Personality
- **Clinical trust** meets **resort luxury** — Nate is a registered nurse delivering medical-grade IV therapy in a premium leisure destination
- Tone: Calm, confident, professional with warmth — never cold-clinical, never party-vibe
- The brand bridges two worlds: medical authority (BSN RN credentials) and Cabo lifestyle (relaxation, wellness, recovery)

### Brand Promise
Professional mobile IV therapy delivered to your door in Los Cabos — hydration, recovery, and wellness by a licensed nurse.

---

## 2. Color System

### Primary Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--medical-teal` | `164 44% 28%` | `#28705E` | Primary brand color, headers, nav, trust elements |
| `--medical-teal-light` | `164 35% 40%` | `#427D6B` | Hover states, secondary buttons |
| `--medical-teal-dark` | `164 50% 20%` | `#1A5C4A` | Active states, text on light backgrounds |
| `--wellness-gold` | `43 74% 66%` | `#E2B855` | CTAs, accents, highlights, pricing |
| `--wellness-gold-light` | `43 74% 76%` | `#EDD08A` | Hover on gold elements, badges |
| `--wellness-gold-dark` | `43 74% 50%` | `#C99A2E` | Active state for gold CTAs |
| `--wellness-cream` | `43 36% 95%` | `#F7F3EB` | Page background, section alternation |
| `--wellness-cream-dark` | `43 20% 90%` | `#EBE6DC` | Card backgrounds on cream sections |

### Neutral Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--neutral-900` | `200 20% 12%` | `#1A2332` | Primary text, headings |
| `--neutral-700` | `200 12% 30%` | `#434F5C` | Body text |
| `--neutral-500` | `200 8% 50%` | `#767F87` | Muted text, captions |
| `--neutral-300` | `200 10% 80%` | `#C5CAD0` | Borders, dividers |
| `--neutral-100` | `200 10% 96%` | `#F2F4F5` | Subtle backgrounds |
| `--white` | `0 0% 100%` | `#FFFFFF` | Card backgrounds, content areas |

### Semantic Colors

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--success` | `152 60% 40%` | `#2EA86B` | Success states, confirmations |
| `--warning` | `38 92% 55%` | `#F5A623` | Warnings, attention |
| `--error` | `0 65% 55%` | `#D44848` | Errors, destructive actions |
| `--info` | `210 70% 55%` | `#3B82C4` | Informational, links |

### Color Usage Rules
1. **Medical teal is dominant** — it appears in the header, footer, section headings, and trust-building elements
2. **Wellness gold is the action color** — every CTA button uses gold; it draws the eye without competing with teal
3. **Wellness cream is the canvas** — alternate between white and cream sections to create visual rhythm
4. **Never use teal on gold or gold on teal** — insufficient contrast. Use white text on teal, dark text on gold
5. **Dark mode is NOT supported** — medical wellness sites perform better in light mode (trust, cleanliness, clinical)

### CSS Variable Mapping (shadcn/ui compatibility)

```css
:root {
  /* shadcn primitives → Liquid Lounge tokens */
  --background: 43 36% 95%;          /* wellness-cream */
  --foreground: 200 20% 12%;         /* neutral-900 */
  --card: 0 0% 100%;                 /* white */
  --card-foreground: 200 20% 12%;    /* neutral-900 */
  --popover: 0 0% 100%;
  --popover-foreground: 200 20% 12%;
  --primary: 164 44% 28%;            /* medical-teal */
  --primary-foreground: 0 0% 100%;   /* white on teal */
  --secondary: 43 36% 95%;           /* wellness-cream */
  --secondary-foreground: 200 20% 12%;
  --muted: 200 10% 96%;              /* neutral-100 */
  --muted-foreground: 200 8% 50%;    /* neutral-500 */
  --accent: 43 74% 66%;              /* wellness-gold */
  --accent-foreground: 200 20% 12%;  /* dark text on gold */
  --destructive: 0 65% 55%;          /* error */
  --destructive-foreground: 0 0% 100%;
  --border: 200 10% 80%;             /* neutral-300 */
  --input: 200 10% 80%;
  --ring: 164 44% 28%;               /* medical-teal */
  --radius: 0.75rem;

  /* Extended Liquid Lounge tokens */
  --medical-teal: 164 44% 28%;
  --medical-teal-light: 164 35% 40%;
  --medical-teal-dark: 164 50% 20%;
  --wellness-gold: 43 74% 66%;
  --wellness-gold-light: 43 74% 76%;
  --wellness-gold-dark: 43 74% 50%;
  --wellness-cream: 43 36% 95%;
  --wellness-cream-dark: 43 20% 90%;

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, hsl(164 44% 28%) 0%, hsl(164 50% 20%) 100%);
  --gradient-gold: linear-gradient(135deg, hsl(43 74% 66%) 0%, hsl(43 74% 50%) 100%);
  --gradient-cream: linear-gradient(180deg, hsl(43 36% 95%) 0%, hsl(0 0% 100%) 100%);
  --gradient-trust: linear-gradient(135deg, hsl(164 44% 28%) 0%, hsl(164 35% 40%) 100%);

  /* Shadows */
  --shadow-sm: 0 1px 3px hsl(200 20% 12% / 0.06);
  --shadow-card: 0 4px 16px hsl(200 20% 12% / 0.06);
  --shadow-lg: 0 8px 30px hsl(200 20% 12% / 0.08);
  --shadow-gold-glow: 0 4px 20px hsl(43 74% 66% / 0.3);
  --shadow-teal-glow: 0 4px 20px hsl(164 44% 28% / 0.2);
}
```

---

## 3. Typography

### Decision: Upgrade from Inter-only

**Headings**: **Cormorant Garamond** (serif) — conveys medical authority, spa elegance, and premium positioning. The serifs communicate trustworthiness and sophistication appropriate for a healthcare-adjacent service.

**Body**: **Inter** (sans-serif) — clean, highly readable, excellent for form labels, descriptions, and UI text. Already in the codebase.

**Accent/UI**: **Inter** — buttons, badges, navigation labels

### Type Scale

| Level | Font | Weight | Size (desktop) | Size (mobile) | Line Height | Letter Spacing | Usage |
|-------|------|--------|-----------------|----------------|-------------|----------------|-------|
| Display | Cormorant Garamond | 600 | 56px / 3.5rem | 36px / 2.25rem | 1.1 | -0.02em | Hero headline only |
| H1 | Cormorant Garamond | 600 | 44px / 2.75rem | 32px / 2rem | 1.15 | -0.01em | Page titles |
| H2 | Cormorant Garamond | 600 | 36px / 2.25rem | 28px / 1.75rem | 1.2 | -0.01em | Section headings |
| H3 | Cormorant Garamond | 600 | 28px / 1.75rem | 22px / 1.375rem | 1.25 | 0 | Subsection headings |
| H4 | Inter | 600 | 20px / 1.25rem | 18px / 1.125rem | 1.3 | 0 | Card titles, labels |
| Body Large | Inter | 400 | 18px / 1.125rem | 16px / 1rem | 1.6 | 0 | Lead paragraphs |
| Body | Inter | 400 | 16px / 1rem | 16px / 1rem | 1.6 | 0 | Default body text |
| Body Small | Inter | 400 | 14px / 0.875rem | 14px / 0.875rem | 1.5 | 0 | Captions, meta |
| Overline | Inter | 600 | 12px / 0.75rem | 12px / 0.75rem | 1.4 | 0.1em | Section labels, badges |

### Typography Rules
1. **One H1 per page** — always. This is both SEO and visual hierarchy
2. **Cormorant Garamond never goes below 22px** — serifs lose legibility at small sizes
3. **Inter for ALL interactive/UI text** — buttons, form labels, nav items, toasts
4. **Section overlines use uppercase Inter** — "OUR SERVICES", "IV MENU", "ABOUT NATE" in teal
5. **Body text is neutral-700**, not black — softer on cream backgrounds
6. **Font loading**: Use `next/font/google` to self-host both fonts with `display: swap`

### Tailwind Config Addition

```ts
fontFamily: {
  heading: ["Cormorant Garamond", "Georgia", "serif"],
  sans: ["Inter", "system-ui", "sans-serif"],
},
```

---

## 4. Spacing System

Base unit: **4px** (0.25rem). All spacing derives from this.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px / 0.25rem | Tight inline gaps |
| `space-2` | 8px / 0.5rem | Icon-to-text, tight padding |
| `space-3` | 12px / 0.75rem | Card internal padding (compact) |
| `space-4` | 16px / 1rem | Default padding, form gaps |
| `space-6` | 24px / 1.5rem | Card padding, component gaps |
| `space-8` | 32px / 2rem | Section content padding |
| `space-12` | 48px / 3rem | Between content blocks |
| `space-16` | 64px / 4rem | Section vertical padding (mobile) |
| `space-20` | 80px / 5rem | Section vertical padding (desktop) |
| `space-24` | 96px / 6rem | Hero vertical padding |

### Section Rhythm
- Alternate between **white** and **cream** backgrounds every section
- Each section: `py-16 md:py-20` (64px mobile, 80px desktop)
- Hero section: `py-20 md:py-24` (80px mobile, 96px desktop)
- Max content width: `max-w-7xl` (1280px) centered with `mx-auto px-4 sm:px-6 lg:px-8`

---

## 5. UI Style: Organic Soft UI

### Style Philosophy
A hybrid of **Soft UI** (gentle shadows, subtle depth) and **Organic/Biophilic** elements (rounded shapes, natural color warmth). This matches the medical wellness spa category — clinical enough to trust, warm enough to relax.

### Border Radius
| Element | Radius | Tailwind |
|---------|--------|----------|
| Buttons | 12px | `rounded-xl` |
| Cards | 16px | `rounded-2xl` |
| Input fields | 12px | `rounded-xl` |
| Badges/chips | 9999px | `rounded-full` |
| Images (hero) | 24px | `rounded-3xl` |
| Modal/dialogs | 20px | `rounded-[20px]` |

### Shadows & Depth
- **Cards at rest**: `shadow-card` — barely visible, 4px blur
- **Cards on hover**: `shadow-lg` — gentle lift, 30px blur
- **CTA buttons**: `shadow-gold-glow` — warm gold glow beneath
- **Never use hard/sharp shadows** — everything is soft and diffused
- **No drop shadows on text** — use background overlays instead

### Hover & Interaction States
| Element | Rest | Hover | Active | Transition |
|---------|------|-------|--------|------------|
| CTA Button (gold) | Gold bg, dark text | Gold-dark bg, slight lift (-2px) | Gold-dark bg, no lift | `all 300ms ease` |
| Secondary Button (teal) | Teal bg, white text | Teal-light bg | Teal-dark bg | `all 300ms ease` |
| Ghost Button | Transparent, teal text | Cream bg | Cream-dark bg | `all 200ms ease` |
| Card | shadow-card | shadow-lg, translateY(-4px) | — | `all 400ms cubic-bezier(0.4, 0, 0.2, 1)` |
| Link | Teal text, no underline | Teal-dark, underline | — | `color 200ms ease` |
| Nav item | neutral-700 text | Teal text | Teal text, bold | `color 200ms ease` |

### Animation Guidelines
- **Max duration**: 400ms for any UI animation
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for movement, `ease` for color/opacity
- **Page transitions**: None — SSR pages should feel instant
- **Scroll animations**: Subtle fade-in-up on section entry, 600ms, `once` (no replay)
- **NO parallax** — medical sites should feel stable and grounded
- **NO auto-playing carousels** — reviews carousel is user-controlled only
- **NO skeleton loaders on SSR pages** — content is already rendered

---

## 6. Component Patterns

### Buttons

| Variant | Background | Text | Border | Shadow | Usage |
|---------|-----------|------|--------|--------|-------|
| **Primary CTA** | `wellness-gold` | `neutral-900` | none | `shadow-gold-glow` | Book Now, Get Started |
| **Secondary** | `medical-teal` | white | none | none | Learn More, View Menu |
| **Ghost** | transparent | `medical-teal` | none | none | Nav links, minor actions |
| **Outline** | transparent | `medical-teal` | 2px `medical-teal` | none | Secondary CTAs |

All buttons: `px-6 py-3 rounded-xl font-sans font-semibold text-sm tracking-wide`
Icon buttons: include `gap-2` with `lucide-react` icons at 18px

### Cards

```
┌──────────────────────────────────┐
│  [Image / Icon area]              │  ← rounded-2xl overflow-hidden
│                                    │
│  OVERLINE                          │  ← uppercase, Inter 600, teal, 12px
│  Card Title                        │  ← Cormorant Garamond 600, 24px
│  Description text that explains    │  ← Inter 400, neutral-700, 16px
│  the service briefly.              │
│                                    │
│  [CTA Button]                      │  ← gold primary or teal secondary
└──────────────────────────────────┘
```

- Background: white
- Border: 1px `neutral-300` (or none if on cream background)
- Padding: `p-6`
- Hover: lift + shadow-lg
- Max width: varies by grid context

### Trust Signals
Medical credibility is essential. Every page should include at least one trust element:
- **Credentials badge**: "BSN RN Licensed Nurse" — teal badge with shield icon
- **Experience callout**: Years of experience, number of treatments
- **Review stars**: Gold stars with count
- **Certification logos**: If available

### Forms
- Labels: Inter 500, neutral-700, above field
- Inputs: `h-12 rounded-xl border-neutral-300 bg-white px-4` with focus ring in teal
- Error text: Inter 400, 14px, error red, below field
- Submit button: Full-width gold CTA at bottom
- Form card: white background, `p-8 rounded-2xl shadow-card`

---

## 7. Iconography

- **Icon library**: Lucide React (already in project)
- **Style**: Outline (strokeWidth 1.5-2), never filled
- **Sizes**: 18px (inline), 24px (default), 32px (feature), 48px (hero feature)
- **Color**: Inherit from parent text color, or `medical-teal` for feature icons
- **Key icons for Liquid Lounge**:
  - `Droplets` — IV therapy / hydration
  - `Heart` — wellness / health
  - `Shield` — medical trust / safety
  - `MapPin` — mobile service / location
  - `Phone` — contact / WhatsApp
  - `Calendar` — booking
  - `Star` — reviews
  - `Clock` — treatment duration
  - `Award` — credentials / certification

---

## 8. Image Treatment

- **Hero images**: Full-bleed or contained with `rounded-3xl`, always with a dark overlay for text legibility (teal gradient overlay, not pure black)
- **Portrait photos** (Nate): `rounded-2xl` with subtle border, never circular crop for professional headshots
- **Treatment photos**: `rounded-2xl`, warm color grading, natural lighting preferred
- **Aspect ratios**: Hero 16:9, Cards 4:3, Thumbnails 1:1
- **Optimization**: All images via `next/image` with WebP/AVIF, lazy loading below fold
- **Alt text**: Descriptive, includes "IV therapy" or "Liquid Lounge" for SEO

---

## 9. Layout Grid

### Breakpoints
| Name | Min Width | Columns | Gutter |
|------|-----------|---------|--------|
| Mobile | 0px | 1 | 16px |
| Tablet | 640px (`sm`) | 2 | 24px |
| Desktop | 1024px (`lg`) | 3-4 | 32px |
| Wide | 1280px (`xl`) | 4 | 32px |

### Content Width
- Max container: `1280px` with `px-4 sm:px-6 lg:px-8`
- Narrow content (text blocks): `max-w-2xl` (672px)
- Medium content (forms, features): `max-w-4xl` (896px)
- Wide content (cards grid, hero): `max-w-7xl` (1280px)

### Common Layouts
- **Service cards**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **IV Menu items**: `grid grid-cols-1 lg:grid-cols-2 gap-8`
- **Two-column (text + image)**: `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`
- **Testimonials**: Embla carousel, 1 visible on mobile, 2 on tablet, 3 on desktop

---

## 10. Anti-Patterns — DO NOT USE

These are explicitly banned across all phases:

| Anti-Pattern | Why |
|-------------|-----|
| Dark mode / dark backgrounds for content sections | Medical wellness = light, clean, trustworthy. Dark UI suggests nightlife/bars |
| Neon or saturated accent colors | Clashes with clinical trust. Gold is the warmest we go |
| Parallax scrolling | Creates motion sickness associations — bad for medical brand |
| Auto-playing video/audio | Intrusive, especially on mobile. Users are often in resorts/hotels |
| Stock photos of generic IV bags | Use real photos of Nate/treatments or illustrated icons instead |
| Harsh animations (bounce, shake, pulse) | Medical = calm and controlled. Use fade and gentle translate only |
| Full-screen modals for non-critical actions | Disorienting. Use slide-over sheets or inline expansion |
| Hamburger menu on desktop | Always show full nav on desktop. Hamburger is mobile-only |
| Text over busy images without overlay | Illegible. Always use gradient overlay on hero images |
| More than 2 font families | Cormorant Garamond + Inter is the limit |
| Centered body text beyond 2-3 lines | Left-align paragraphs. Center only for short headlines and CTAs |
| Infinite scroll | Finite pages with clear navigation. Every page has a footer |
| Cookie banners or chat widgets | Keep the UI clean. No popups, no chat bubbles |
| Generic testimonial layouts | Use real names, real context (e.g., "Recovery after deep sea fishing trip") |

---

## 11. Accessibility Standards

- **WCAG 2.1 AA** minimum compliance
- **Color contrast**: 4.5:1 for body text, 3:1 for large text (headings 24px+)
  - White on medical-teal: ~6.5:1 (passes)
  - Neutral-900 on wellness-gold: ~4.8:1 (passes)
  - Neutral-900 on wellness-cream: ~14:1 (passes)
- **Focus indicators**: 2px solid teal ring on all interactive elements
- **Touch targets**: Minimum 44x44px on mobile
- **Image alt text**: Required on all images
- **Heading hierarchy**: Sequential (H1 → H2 → H3), never skip levels
- **Form labels**: Always visible, never placeholder-only

---

## 12. Pre-Delivery Checklist

Before marking ANY component or page as complete, verify:

- [ ] Colors use Liquid Lounge tokens only — no hardcoded hex values, no orange/CF remnants
- [ ] Typography uses Cormorant Garamond for headings, Inter for body/UI
- [ ] All interactive elements have hover, focus, and active states
- [ ] Shadows are soft (no sharp/hard shadows)
- [ ] Border radius follows the component table (buttons xl, cards 2xl, etc.)
- [ ] Animations are ≤400ms with appropriate easing
- [ ] No anti-patterns from Section 10 are present
- [ ] Responsive: tested at 375px, 768px, 1024px, 1280px
- [ ] Color contrast meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] All images have alt text
- [ ] Heading hierarchy is sequential (no H1 → H3 skip)
- [ ] CTA buttons use gold, secondary actions use teal
- [ ] Trust signal present on the page (credentials, reviews, etc.)
- [ ] No hardcoded text — all content is maintainable
- [ ] Page has unique metadata (title, description) — handled in Phase 3
