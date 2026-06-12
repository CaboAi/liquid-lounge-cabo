// JSON-LD for the Find Your IV page: breadcrumb.

export const findYourIvBreadcrumbSchema = {
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
      name: "Find Your IV",
      item: "https://liquidloungeiv.com/find-your-iv",
    },
  ],
};
