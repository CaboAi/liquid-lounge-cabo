// JSON-LD for the About page: Nathan Brown (Person) + breadcrumb.

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://liquidloungeiv.com/about#nathan-brown",
  name: "Nathan Brown",
  givenName: "Nathan",
  familyName: "Brown",
  jobTitle: "Founder & Licensed BSN Registered Nurse",
  description:
    "Nathan Brown is the founder of Liquid Lounge Mobile IV Therapy and a licensed BSN Registered Nurse with over 10 years of clinical experience. He brings hospital-grade IV therapy, blood work diagnostics, and health consultations directly to clients throughout Los Cabos, Mexico.",
  url: "https://liquidloungeiv.com/about",
  image: {
    "@type": "ImageObject",
    url: "https://liquidloungeiv.com/images/nate-headshot.jpg",
    contentUrl: "https://liquidloungeiv.com/images/nate-headshot.jpg",
  },
  worksFor: { "@id": "https://liquidloungeiv.com/#organization" },
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "Bachelor of Science in Nursing (BSN)",
      competencyRequired: "Registered Nursing",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "Registered Nurse (RN)",
      competencyRequired: "Licensed clinical nursing practice",
    },
  ],
  knowsAbout: [
    "IV Therapy",
    "Intravenous Nutrient Infusion",
    "Blood Work Diagnostics",
    "NAD+ Therapy",
    "Glutathione Infusion",
    "Vitamin C IV Therapy",
    "Hydration Therapy",
    "Wellness Consultations",
    "Mobile Medical Services",
  ],
};

export const aboutBreadcrumbSchema = {
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
      name: "About",
      item: "https://liquidloungeiv.com/about",
    },
  ],
};
