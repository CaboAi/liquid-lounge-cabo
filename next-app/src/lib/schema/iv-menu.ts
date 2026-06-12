import { ivMenuFaqs } from "@/lib/data";

// FAQPage JSON-LD is built from the same ivMenuFaqs array that renders the
// visible accordion, so structured data always matches on-page content.

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://liquidloungeiv.com/iv-menu#faq",
  mainEntity: ivMenuFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export const ivMenuBreadcrumbSchema = {
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
      name: "IV Menu",
      item: "https://liquidloungeiv.com/iv-menu",
    },
  ],
};
