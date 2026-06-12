// JSON-LD for the homepage. The MedicalBusiness block is the single canonical
// organization entity for the site (referenced by @id from other pages).

export const medicalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://liquidloungeiv.com/#organization",
  name: "Liquid Lounge Mobile IV Therapy",
  url: "https://liquidloungeiv.com",
  logo: {
    "@type": "ImageObject",
    url: "https://liquidloungeiv.com/images/logo-horizontal-stack.svg",
    contentUrl: "https://liquidloungeiv.com/images/logo-horizontal-stack.svg",
  },
  image: {
    "@type": "ImageObject",
    url: "https://liquidloungeiv.com/images/og-image.jpg",
    contentUrl: "https://liquidloungeiv.com/images/og-image.jpg",
  },
  description:
    "Liquid Lounge Mobile IV Therapy delivers personalized IV vitamin infusions, blood work diagnostics, and health consultations directly to your location throughout Los Cabos, Mexico. Founded by a licensed BSN Registered Nurse with 10+ years of clinical experience.",
  telephone: "+526242287777",
  email: "liquidloungeiv@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cabo San Lucas",
    addressRegion: "Baja California Sur",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 23.0352681,
    longitude: -109.8249814,
  },
  areaServed: [
    { "@type": "City", name: "Cabo San Lucas", addressCountry: "MX" },
    { "@type": "City", name: "San Jose del Cabo", addressCountry: "MX" },
    { "@type": "AdministrativeArea", name: "Los Cabos", addressCountry: "MX" },
    { "@type": "AdministrativeArea", name: "The Corridor", addressCountry: "MX" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "07:00",
      closes: "22:00",
    },
  ],
  priceRange: "$$",
  currenciesAccepted: "USD, MXN",
  paymentAccepted: "Cash, Credit Card",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "44",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://www.instagram.com/liquidloungeiv",
    "https://www.facebook.com/liquidloungeiv",
  ],
  hasMap: "https://maps.app.goo.gl/JszkUHYBxfJh3pYN9",
  founder: { "@id": "https://liquidloungeiv.com/about#nathan-brown" },
  medicalSpecialty: "Nursing",
};

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://liquidloungeiv.com/#website",
  name: "Liquid Lounge Mobile IV Therapy",
  url: "https://liquidloungeiv.com",
  description:
    "Mobile IV therapy, blood work diagnostics, and health consultations delivered to your location throughout Los Cabos, Mexico.",
  inLanguage: "en-US",
  publisher: { "@id": "https://liquidloungeiv.com/#organization" },
};
