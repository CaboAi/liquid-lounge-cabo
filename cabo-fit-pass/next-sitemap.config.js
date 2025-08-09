/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cabofitpass.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/_next/',
          '/auth/',
          '/onboarding/',
          '/checkout/',
          '/profile/',
          '/settings/',
          '/studio/dashboard/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/_next/',
          '/auth/',
          '/onboarding/',
          '/checkout/',
          '/profile/',
          '/settings/',
          '/studio/dashboard/',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://cabofitpass.com'}/server-sitemap.xml`,
    ],
  },
  // Exclude dynamic and private pages
  exclude: [
    '/api/*',
    '/dashboard/*',
    '/admin/*',
    '/auth/*',
    '/onboarding/*',
    '/checkout/*',
    '/profile/*',
    '/settings/*',
    '/studio/dashboard/*',
    '/404',
    '/500',
    '/server-sitemap.xml',
  ],
  // Additional configuration
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
  // Transform function to add custom properties
  transform: async (config, path) => {
    // Custom priority and changefreq for specific pages
    let priority = 0.7
    let changefreq = 'daily'
    
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/classes')) {
      priority = 0.9
      changefreq = 'hourly'
    } else if (path.startsWith('/studios')) {
      priority = 0.8
      changefreq = 'daily'
    } else if (path.startsWith('/about') || path.startsWith('/help')) {
      priority = 0.5
      changefreq = 'weekly'
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [
        {
          href: `${config.siteUrl}/es${path}`,
          hreflang: 'es',
        },
        {
          href: `${config.siteUrl}/en${path}`,
          hreflang: 'en',
        },
        {
          href: `${config.siteUrl}${path}`,
          hreflang: 'x-default',
        },
      ],
    }
  },
}