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
    "Premium mobile IV therapy services in Los Cabos, Mexico. Licensed RN delivering hospital-grade hydration, vitamin, and wellness treatments.",
  url: "https://liquidloungeiv.com",
  telephone: "+526242287777",
  email: "liquidloungeiv@gmail.com",
  image: "https://liquidloungeiv.com/images/og-image.jpg",
  logo: "https://liquidloungeiv.com/images/og-image.jpg",
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
    jobTitle: "BSN RN",
    description:
      "Licensed Registered Nurse specializing in mobile IV therapy in Los Cabos",
  },
  sameAs: [
    "https://www.instagram.com/liquidlounge.iv/",
    "https://www.facebook.com/share/1PBaJhWUMn/?mibextid=wwXIfr",
    "https://maps.app.goo.gl/JszkUHYBxfJh3pYN9",
  ],
};
