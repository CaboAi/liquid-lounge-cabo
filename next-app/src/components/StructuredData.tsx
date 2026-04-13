interface StructuredDataProps {
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "MedicalBusiness"],
  name: "Liquid Lounge Mobile IV Therapy",
  description:
    "Premium mobile IV therapy services in Los Cabos, Mexico. Licensed medical professionals delivering hospital-grade hydration, vitamin, and wellness treatments.",
  url: "https://liquidloungeiv.com",
  telephone: "+526242287777",
  email: "liquidloungeiv@gmail.com",
  image: "https://liquidloungeiv.com/images/og-image.jpg",
  logo: {
    "@type": "ImageObject",
    url: "https://liquidloungeiv.com/images/logo-horizontal-stack.svg",
    width: 795,
    height: 350,
  },
  priceRange: "$250-$500",
  currenciesAccepted: "USD, MXN",
  paymentAccepted: "Cash, Credit Card, Digital Transfer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cabo San Lucas",
    addressRegion: "Baja California Sur",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 22.8905,
    longitude: -109.9167,
  },
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 22.8905,
      longitude: -109.9167,
    },
    geoRadius: "50000",
  },
  openingHoursSpecification: {
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
  founder: {
    "@type": "Person",
    name: "Nathan Brown",
    jobTitle: "Founder & Licensed Medical Professional",
    description:
      "Licensed medical professional specializing in mobile IV therapy in Los Cabos",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    reviewCount: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Sarah M." },
      datePublished: "2026-02-15",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "The hangover IV saved our deep sea fishing trip. Nate came to the marina at 7am and had us feeling amazing by the time we boarded. Absolute lifesaver!",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "James & Lisa R." },
      datePublished: "2026-01-20",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "We booked the Immune Boost before our flight home. Super professional, Nate explained everything, and we felt great the entire trip back. Highly recommend.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Mike T." },
      datePublished: "2026-03-10",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Third time using Liquid Lounge this year. Nate is the real deal — licensed RN, knows his stuff, and makes you feel totally comfortable. The Energy IV is my go-to.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Amanda K." },
      datePublished: "2025-12-10",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Got the Beauty Glow IV before a friend's wedding here. My skin was literally glowing the next day. Worth every penny. Nate was so professional and kind.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Carlos & Maria G." },
      datePublished: "2026-01-08",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "We were skeptical but our concierge recommended Nate. He came to our room, set everything up, and we felt incredible. Now we book every time we visit Cabo.",
    },
  ],
  sameAs: [
    "https://www.instagram.com/liquidlounge.iv/",
    "https://www.facebook.com/share/1PBaJhWUMn/?mibextid=wwXIfr",
    "https://maps.app.goo.gl/JszkUHYBxfJh3pYN9",
  ],
};
