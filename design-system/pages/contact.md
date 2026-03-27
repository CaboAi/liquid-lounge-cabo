# Contact / Booking — Design Overrides

> **Route**: `/contact`
> **Render Mode**: Client Component (form state, Supabase integration)
> **Pattern**: Conversion Form with Trust Reinforcement
> **Overrides**: These rules take precedence over MASTER.md for the contact/booking page only

---

## Page Structure

```
1. Page Header              — Title + reassurance text
2. Two-Column Layout        — Form left, trust panel right
3. Alternative Contact      — WhatsApp + phone below form
4. Service Area Map/Info    — Where Nate operates
```

---

## Section 1: Page Header

### Layout
- **Background**: Teal gradient (`gradient-hero`) — short banner
- **Height**: `py-16 md:py-20`
- **Centered text**, max-w-3xl

### Content
```
OVERLINE: "GET STARTED" (Inter 600, 12px, uppercase, gold)
HEADLINE: "Book Your IV Therapy" (Cormorant Garamond 600, 44px, white)
SUBTEXT: "Fill out the form below and Nate will confirm your
appointment within 1 hour. Same-day availability."
(Inter 400, 18px, white/80%)
```

---

## Section 2: Two-Column Form Layout

### Desktop Layout
```
┌─────────────────────────┬──────────────────────┐
│                         │                      │
│  BOOKING FORM           │  TRUST PANEL         │
│  (60% width)            │  (40% width)         │
│                         │                      │
│  [First Name]           │  ┌──────────────┐   │
│  [Last Name]            │  │ [Shield]      │   │
│  [Email]                │  │ Licensed RN   │   │
│  [Phone]                │  │ BSN Certified │   │
│  [Preferred Therapy ▾]  │  └──────────────┘   │
│  [Preferred Date]       │                      │
│  [Preferred Time ▾]     │  ┌──────────────┐   │
│  [Service Location ▾]   │  │ [Clock]       │   │
│  [Additional Info]      │  │ Responds in   │   │
│                         │  │ under 1 hour  │   │
│  [Book My IV Session]   │  └──────────────┘   │
│  (gold, full-width)     │                      │
│                         │  ┌──────────────┐   │
│                         │  │ ★★★★★         │   │
│                         │  │ "Best IV      │   │
│                         │  │  experience"  │   │
│                         │  │ — Sarah M.    │   │
│                         │  └──────────────┘   │
│                         │                      │
└─────────────────────────┴──────────────────────┘
```

### Mobile Layout
- **Single column**: Form on top, trust panel collapses to a horizontal trust bar between header and form
- Trust bar: `grid-cols-3`, icons + short labels only

### Grid
- Desktop: `grid grid-cols-1 lg:grid-cols-5 gap-12`
- Form column: `lg:col-span-3`
- Trust column: `lg:col-span-2`

---

## Form Design

### Form Container
- **Background**: White
- **Border**: None (sits on cream background)
- **Radius**: `rounded-2xl`
- **Padding**: `p-6 md:p-8`
- **Shadow**: `shadow-card`

### Input Fields

| Property | Value |
|----------|-------|
| Height | `h-12` (48px) — meets 44px touch target |
| Border | 1px `neutral-300` |
| Border radius | `rounded-xl` |
| Background | White |
| Padding | `px-4` |
| Font | Inter 400, 16px |
| Placeholder | `neutral-500`, Inter 400 |
| Focus | `ring-2 ring-medical-teal border-medical-teal` |
| Error | `border-error ring-error` |
| Transition | `all 200ms ease` |

### Labels
- **Position**: Above field, `mb-1.5`
- **Font**: Inter 500, 14px, `neutral-700`
- **Required indicator**: Red asterisk after label text

### Select Dropdowns
- Same styling as inputs
- Chevron icon: `neutral-500`, right side
- Options: Native select (no custom dropdown — better mobile UX)

### Textarea (Additional Info)
- `min-h-[120px]`, resizable vertically
- Same border/focus styles as inputs
- Placeholder: "Any special requests, hotel name, or health considerations..."

### Field Layout
- **Two-column for name**: `grid grid-cols-1 sm:grid-cols-2 gap-4` for First/Last name
- **Single column for everything else**
- **Vertical gap between fields**: `space-y-4`

### Submit Button
- **Full width** within form
- **Gold CTA**: `bg-wellness-gold hover:bg-wellness-gold-dark text-neutral-900`
- **Height**: `h-14` (56px) — larger than inputs for emphasis
- **Font**: Inter 600, 16px
- **Shadow**: `shadow-gold-glow`
- **Loading state**: Spinner icon + "Submitting..." text, button disabled
- **Success state**: Green checkmark + "Booking Submitted!" — then show success message below form
- **Margin top**: `mt-6`

### Form Validation
- **Inline validation**: Show error below field on blur
- **Error text**: Inter 400, 14px, `error` red
- **Required fields**: First name, last name, phone, preferred therapy
- **Phone format**: Accept international format (+52...)
- **No CAPTCHA** — NotificationAPI rate limiting handles abuse

---

## Trust Panel

### Panel Container
- **Background**: `wellness-cream`
- **Border**: None
- **Radius**: `rounded-2xl`
- **Padding**: `p-6`
- **Position**: `sticky top-24` on desktop (follows scroll)

### Trust Cards (within panel)
Each trust card:
- White background, `rounded-xl`, `p-4`
- Icon: 24px, `medical-teal`
- Title: Inter 600, 14px, `neutral-900`
- Description: Inter 400, 13px, `neutral-500`
- Margin between cards: `space-y-4`

### Trust Elements to Include
1. **Licensed Professional**: Shield icon — "BSN RN Licensed Nurse"
2. **Response Time**: Clock icon — "Confirms within 1 hour"
3. **Service Area**: MapPin icon — "All Los Cabos — hotels, villas, yachts"
4. **Mini Testimonial**: Star icon — 1 short review quote

---

## Section 3: Alternative Contact

### Layout
- **Below the form**, centered
- **Background**: White
- **Padding**: `py-8`

### Content
```
"Prefer to message directly?"

[WhatsApp Nate]          [Call +52 624 228 7777]
(teal button +           (outline button +
 WhatsApp icon)           Phone icon)
```

- **Divider**: "or" text between the two-column layout and these buttons
- Both buttons: `rounded-xl`, standard button sizing
- WhatsApp: `bg-[#25D366] text-white` (WhatsApp brand green)
- Call: `border-2 border-medical-teal text-medical-teal`

---

## Section 4: Service Area

### Layout
- **Background**: `wellness-cream`
- **Padding**: `py-12`
- **Max-width**: `max-w-4xl`, centered

### Content
- **Heading**: "Where We Serve" (H2, Cormorant Garamond)
- **Text**: Brief description of service area
- **Location list**: Badge-style pills for areas served
  - "San Jose del Cabo" | "Cabo San Lucas" | "The Corridor" | "Puerto Los Cabos"
  - Each pill: `rounded-full bg-medical-teal/10 text-medical-teal px-4 py-1.5 text-sm`
- Optional: Simple map image or illustration

---

## Success State

After successful form submission:

### Display
- Form slides up/fades out
- Success card appears in its place
- Green checkmark animation (subtle, 500ms)

### Success Card Content
```
┌──────────────────────────────────┐
│         ✓ (green circle)          │
│                                    │
│  Booking Request Submitted!        │  ← Cormorant Garamond, 28px
│                                    │
│  Thanks, {firstName}! Nate will    │  ← Inter, 16px, neutral-700
│  confirm your {therapy} session    │
│  within 1 hour.                    │
│                                    │
│  Check your phone for an SMS       │
│  confirmation at {phone}.          │
│                                    │
│  [Back to Home]  [WhatsApp Nate]   │
└──────────────────────────────────┘
```

- Card: White, `rounded-2xl`, `p-8`, `shadow-card`
- Checkmark: 48px, `success` green, animated scale-in

---

## Contact Page-Specific Rules

1. **Form must work without JavaScript initially loading** — the submit button should be disabled until React hydrates, but the form fields should be visible and fillable from SSR
2. **Never auto-scroll to form on page load** — let the user read the header context first
3. **Phone input should default to Mexico country code** (+52) since target customers are in Cabo
4. **"Preferred Therapy" dropdown** should match the IV Menu treatment names exactly — single source of truth
5. **No multi-step form wizard** — all fields visible on one screen. The form is short enough (8 fields) to not need steps
6. **Toast notification on success** in addition to the success card — for screen readers and users who might miss the visual change
7. **SMS notification flow**: Form → Supabase insert → Edge Function → NotificationAPI → SMS to Nate. This is existing and unchanged — just ensure env vars are swapped from VITE_ to NEXT_PUBLIC_
8. **Preserve field data on validation error** — never clear the form on a failed submission
