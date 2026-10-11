import { SITE } from '@/config/site';

/**
 * schema.org structured data describing the site, the app, the building, and the four
 * organizations whose events it aggregates, so search engines and AI answer engines can
 * resolve "what is this / who runs it / where" without parsing the calendar UI.
 */
export function JsonLd() {
  const id = (fragment: string) => `${SITE.url}/#${fragment}`;
  const logo = (file: string) => `${SITE.url}/${file}`;

  const organizations = [
    {
      '@type': 'Organization',
      '@id': id('mwphgldc'),
      name: 'Most Worshipful Prince Hall Grand Lodge of DC',
      alternateName: 'MWPHGLDC',
      url: 'https://www.mwphgldc.com',
      logo: logo('mwphgldc_logo.png'),
    },
    {
      '@type': 'Organization',
      '@id': id('gtgc'),
      name: 'Georgiana Thomas Grand Chapter, Order of the Eastern Star, PHA',
      alternateName: 'GTGC',
      url: 'https://www.facebook.com/gtgcdc/',
      logo: logo('gtgc_logo.jpg'),
    },
    {
      '@type': 'Organization',
      '@id': id('phfamoescef'),
      name: 'PHFAMOESCEF',
      description: 'Charitable & Educational Foundation',
      url: 'https://www.phfamoescef.com',
      logo: logo('cef_logo.jpeg'),
    },
    {
      '@type': 'Organization',
      '@id': id('cef-thc'),
      name: 'CEF THC (Title Holding Company)',
      alternateName: 'CEF THC',
      url: 'https://cef-thc.netlify.app/',
      logo: logo('cef_thc_logo.png'),
      location: { '@id': id('temple') },
    },
  ];

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: SITE.url,
        name: SITE.name,
        alternateName: SITE.shortName,
        description: SITE.longDescription,
        inLanguage: SITE.language,
        creator: { '@id': id('builder') },
        about: organizations.map((org) => ({ '@id': org['@id'] })),
      },
      {
        '@type': 'WebApplication',
        '@id': id('app'),
        url: SITE.url,
        name: SITE.name,
        description: SITE.longDescription,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        image: `${SITE.url}/icons/icon-512.png`,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        creator: { '@id': id('builder') },
      },
      {
        '@type': 'Organization',
        '@id': id('builder'),
        name: SITE.builder.name,
        url: SITE.builder.url,
      },
      {
        '@type': 'Place',
        '@id': id('temple'),
        name: 'Prince Hall Masonic Temple',
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.region,
          postalCode: SITE.address.postalCode,
          addressCountry: SITE.address.country,
        },
      },
      ...organizations,
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so no string in the payload can close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  );
}
