// JSON-LD for the Services page: Service @graph + breadcrumb.

const areaServed = [
  { "@type": "City", name: "Cabo San Lucas", addressCountry: "MX" },
  { "@type": "City", name: "San Jose del Cabo", addressCountry: "MX" },
  { "@type": "AdministrativeArea", name: "Los Cabos", addressCountry: "MX" },
];

const availableChannel = {
  "@type": "ServiceChannel",
  serviceUrl: "https://liquidloungeiv.com/contact",
  servicePhone: "+526242287777",
};

export const servicesSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://liquidloungeiv.com/services#blood-work-diagnostics",
      serviceType: "Blood Work Diagnostics",
      name: "Mobile Blood Work Diagnostics",
      url: "https://liquidloungeiv.com/services",
      description:
        "Comprehensive on-site laboratory testing and health assessments performed at your location throughout Los Cabos. Our licensed RN collects samples and provides detailed health panels to give you a complete picture of your wellness.",
      provider: { "@id": "https://liquidloungeiv.com/#organization" },
      areaServed,
      availableChannel,
    },
    {
      "@type": "Service",
      "@id": "https://liquidloungeiv.com/services#iv-therapies",
      serviceType: "IV Therapy",
      name: "Mobile IV Therapy",
      url: "https://liquidloungeiv.com/iv-menu",
      description:
        "Personalized and group intravenous vitamin and nutrient infusions delivered to your hotel, villa, yacht, or residence. Formulas include vitamins B1 through B12, Vitamin C, Magnesium, Zinc, Vitamins D, A and E, NAD+, Glutathione, L-Lysine, L-Carnitine, and full fluid and electrolyte replenishment.",
      provider: { "@id": "https://liquidloungeiv.com/#organization" },
      areaServed,
      availableChannel,
    },
    {
      "@type": "Service",
      "@id": "https://liquidloungeiv.com/services#health-consultations",
      serviceType: "Health Consultation",
      name: "Wellness Health Consultations",
      url: "https://liquidloungeiv.com/services",
      description:
        "Professional one-on-one wellness consultations with a licensed BSN Registered Nurse. Discuss your health goals, review lab results, and receive a personalized treatment plan for IV therapy and ongoing wellness.",
      provider: { "@id": "https://liquidloungeiv.com/#organization" },
      areaServed,
      availableChannel,
    },
  ],
};

export const servicesBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://liquidloungeiv.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Services",
      item: "https://liquidloungeiv.com/services",
    },
  ],
};
