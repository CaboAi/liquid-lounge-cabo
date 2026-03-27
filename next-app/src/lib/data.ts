import {
  Droplets,
  Shield,
  Zap,
  Sparkles,
  Pill,
  Heart,
  type LucideIcon,
} from "lucide-react";

// ── IV Therapy Packages ──────────────────────────────────────────────

export interface IVPackage {
  id: string;
  name: string;
  category: "recovery" | "wellness" | "beauty" | "custom";
  tagline: string;
  description: string;
  ingredients: string[];
  duration: string;
  volume: string;
  price: number;
  popular?: boolean;
  icon: LucideIcon;
}

export const ivPackages: IVPackage[] = [
  {
    id: "hangover-recovery",
    name: "Hangover Recovery",
    category: "recovery",
    tagline: "Get back to your vacation",
    description:
      "Our signature recovery drip replenishes fluids, electrolytes, and essential vitamins to get you back to feeling your best after a night out in Cabo.",
    ingredients: [
      "1L Normal Saline",
      "B-Complex",
      "Anti-Nausea (Zofran)",
      "Anti-Inflammatory (Toradol)",
      "Electrolytes",
    ],
    duration: "30-45 min",
    volume: "1000ml",
    price: 250,
    popular: true,
    icon: Droplets,
  },
  {
    id: "immune-boost",
    name: "Immune Boost",
    category: "wellness",
    tagline: "Supercharge your defenses",
    description:
      "High-dose Vitamin C and Zinc combined with hydration to strengthen your immune system. Perfect before or after travel.",
    ingredients: [
      "1L Normal Saline",
      "Vitamin C (high dose)",
      "Zinc",
      "B-Complex",
      "Glutathione",
    ],
    duration: "45-60 min",
    volume: "1000ml",
    price: 275,
    icon: Shield,
  },
  {
    id: "energy-wellness",
    name: "Energy & Wellness",
    category: "wellness",
    tagline: "Recharge your body",
    description:
      "A comprehensive blend of B vitamins, amino acids, and minerals to boost energy levels, improve mental clarity, and support overall wellness.",
    ingredients: [
      "1L Normal Saline",
      "B12",
      "B-Complex",
      "Magnesium",
      "Amino Acids",
      "Vitamin C",
    ],
    duration: "45-60 min",
    volume: "1000ml",
    price: 275,
    icon: Zap,
  },
  {
    id: "beauty-glow",
    name: "Beauty Glow",
    category: "beauty",
    tagline: "Radiance from within",
    description:
      "Glutathione and biotin combined with hydration for glowing skin, stronger hair, and healthier nails. The ultimate pre-event treatment.",
    ingredients: [
      "1L Normal Saline",
      "Glutathione",
      "Biotin",
      "Vitamin C",
      "B-Complex",
    ],
    duration: "45-60 min",
    volume: "1000ml",
    price: 300,
    icon: Sparkles,
  },
  {
    id: "myers-cocktail",
    name: "Myers' Cocktail",
    category: "wellness",
    tagline: "The gold standard",
    description:
      "The original IV vitamin therapy formula. A balanced blend of essential vitamins and minerals used by physicians worldwide for decades.",
    ingredients: [
      "1L Normal Saline",
      "Magnesium",
      "Calcium",
      "B-Complex",
      "B12",
      "Vitamin C",
    ],
    duration: "45-60 min",
    volume: "1000ml",
    price: 285,
    popular: true,
    icon: Pill,
  },
  {
    id: "custom-formulation",
    name: "Custom Formulation",
    category: "custom",
    tagline: "Tailored to your needs",
    description:
      "Work directly with Nate to create a personalized IV blend based on your specific health goals and needs. Consultation included.",
    ingredients: [
      "Custom base fluid",
      "Vitamins (your choice)",
      "Minerals",
      "Add-ons available",
    ],
    duration: "30-60 min",
    volume: "500-1000ml",
    price: 300,
    icon: Heart,
  },
];

// ── Services ──────────────────────────────────────────────────────────

export interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
}

export const services: Service[] = [
  {
    title: "Hangover Recovery",
    description:
      "Rehydrate and recover fast with our signature IV drip. Get back to enjoying Cabo in under an hour.",
    icon: Droplets,
    link: "/iv-menu",
  },
  {
    title: "Immune Support",
    description:
      "Boost your immune system with high-dose Vitamin C, Zinc, and essential nutrients before or after your trip.",
    icon: Shield,
    link: "/iv-menu",
  },
  {
    title: "Energy & Wellness",
    description:
      "Feel your best with a customized blend of B vitamins, amino acids, and hydration tailored to your goals.",
    icon: Zap,
    link: "/iv-menu",
  },
];

// ── Reviews ───────────────────────────────────────────────────────────

export interface Review {
  name: string;
  rating: number;
  text: string;
  context: string;
  date: string;
}

export const reviews: Review[] = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "The hangover IV saved our deep sea fishing trip. Nate came to the marina at 7am and had us feeling amazing by the time we boarded. Absolute lifesaver!",
    context: "Hotel guest, Cabo San Lucas",
    date: "Feb 2026",
  },
  {
    name: "James & Lisa R.",
    rating: 5,
    text: "We booked the Immune Boost before our flight home. Super professional, Nate explained everything, and we felt great the entire trip back. Highly recommend.",
    context: "Villa rental, San Jose del Cabo",
    date: "Jan 2026",
  },
  {
    name: "Mike T.",
    rating: 5,
    text: "Third time using Liquid Lounge this year. Nate is the real deal — licensed RN, knows his stuff, and makes you feel totally comfortable. The Energy IV is my go-to.",
    context: "Repeat client, The Corridor",
    date: "Mar 2026",
  },
  {
    name: "Amanda K.",
    rating: 5,
    text: "Got the Beauty Glow IV before a friend's wedding here. My skin was literally glowing the next day. Worth every penny. Nate was so professional and kind.",
    context: "Wedding guest, Palmilla",
    date: "Dec 2025",
  },
  {
    name: "Carlos & Maria G.",
    rating: 5,
    text: "We were skeptical but our concierge recommended Nate. He came to our room, set everything up, and we felt incredible. Now we book every time we visit Cabo.",
    context: "Hotel guests, Grand Velas",
    date: "Jan 2026",
  },
];

// ── Quiz Questions ────────────────────────────────────────────────────

export interface QuizOption {
  label: string;
  value: string;
  points: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

// Compact Quiz (3 questions, homepage)
export const compactQuizQuestions: QuizQuestion[] = [
  {
    id: "feeling",
    question: "How are you feeling right now?",
    options: [
      {
        label: "Hungover / Dehydrated",
        value: "hungover",
        points: { "hangover-recovery": 3, "energy-wellness": 1 },
      },
      {
        label: "Low energy / Fatigued",
        value: "tired",
        points: { "energy-wellness": 3, "myers-cocktail": 2 },
      },
      {
        label: "Under the weather",
        value: "sick",
        points: { "immune-boost": 3, "myers-cocktail": 1 },
      },
      {
        label: "Want to look my best",
        value: "beauty",
        points: { "beauty-glow": 3, "energy-wellness": 1 },
      },
    ],
  },
  {
    id: "timeline",
    question: "When do you need to feel better?",
    options: [
      {
        label: "ASAP — I have plans today",
        value: "asap",
        points: { "hangover-recovery": 2, "energy-wellness": 1 },
      },
      {
        label: "Within the next day or two",
        value: "soon",
        points: { "immune-boost": 1, "myers-cocktail": 2 },
      },
      {
        label: "Preventative — trip just started",
        value: "preventative",
        points: { "immune-boost": 2, "energy-wellness": 1 },
      },
      {
        label: "Special event coming up",
        value: "event",
        points: { "beauty-glow": 2, "energy-wellness": 1 },
      },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      {
        label: "Fast relief from symptoms",
        value: "relief",
        points: { "hangover-recovery": 2, "myers-cocktail": 1 },
      },
      {
        label: "Boosting my immune system",
        value: "immunity",
        points: { "immune-boost": 3 },
      },
      {
        label: "Overall energy and wellness",
        value: "energy",
        points: { "energy-wellness": 2, "myers-cocktail": 2 },
      },
      {
        label: "Skin, hair, and appearance",
        value: "appearance",
        points: { "beauty-glow": 3 },
      },
    ],
  },
];

// Full Quiz (5 questions, /find-your-iv)
export const fullQuizQuestions: QuizQuestion[] = [
  ...compactQuizQuestions,
  {
    id: "age",
    question: "What age range are you in?",
    options: [
      {
        label: "18-30",
        value: "young",
        points: { "hangover-recovery": 1, "beauty-glow": 1 },
      },
      {
        label: "31-45",
        value: "mid",
        points: { "energy-wellness": 1, "myers-cocktail": 1 },
      },
      {
        label: "46-60",
        value: "mature",
        points: { "immune-boost": 1, "myers-cocktail": 1 },
      },
      {
        label: "60+",
        value: "senior",
        points: { "immune-boost": 2, "myers-cocktail": 1 },
      },
    ],
  },
  {
    id: "exercise",
    question: "How active are you on this trip?",
    options: [
      {
        label: "Very active — surfing, hiking, sports",
        value: "very-active",
        points: { "energy-wellness": 2, "hangover-recovery": 1 },
      },
      {
        label: "Moderately active — swimming, walking",
        value: "moderate",
        points: { "myers-cocktail": 1, "immune-boost": 1 },
      },
      {
        label: "Relaxing — pool, spa, lounging",
        value: "relaxing",
        points: { "beauty-glow": 1, "immune-boost": 1 },
      },
      {
        label: "Partying — nightlife, dining out",
        value: "partying",
        points: { "hangover-recovery": 2, "energy-wellness": 1 },
      },
    ],
  },
];

// ── Contact Info ──────────────────────────────────────────────────────

export const contactInfo = {
  phone: "+52 624 228 7777",
  phoneHref: "tel:+526242287777",
  whatsappHref:
    "https://wa.me/526242287777?text=Hi%20Nate!%20I%27d%20like%20to%20book%20an%20IV%20therapy%20session.",
  email: "info@liquidloungeiv.com",
  instagram: "https://instagram.com/liquidloungeiv",
  facebook: "https://facebook.com/liquidloungeiv",
  googleReviews: "https://g.page/liquidloungeiv",
  serviceAreas: [
    "San Jose del Cabo",
    "Cabo San Lucas",
    "The Corridor",
    "Puerto Los Cabos",
  ],
  hours: "7:00 AM - 10:00 PM, 7 days a week",
};

// ── Navigation ────────────────────────────────────────────────────────

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "IV Menu", href: "/iv-menu" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ── Form Options ──────────────────────────────────────────────────────

export const therapyOptions = ivPackages.map((p) => ({
  value: p.id,
  label: p.name,
}));

export const timeOptions = [
  { value: "morning", label: "Morning (7am - 11am)" },
  { value: "midday", label: "Midday (11am - 2pm)" },
  { value: "afternoon", label: "Afternoon (2pm - 5pm)" },
  { value: "evening", label: "Evening (5pm - 10pm)" },
];

export const locationOptions = [
  { value: "hotel", label: "Hotel" },
  { value: "villa", label: "Villa / Airbnb" },
  { value: "yacht", label: "Yacht / Boat" },
  { value: "office", label: "Office / Workspace" },
  { value: "other", label: "Other" },
];
