// JSON-LD for the Contact page: breadcrumb.

export const contactBreadcrumbSchema = {
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
      name: "Contact",
      item: "https://liquidloungeiv.com/contact",
    },
  ],
};
