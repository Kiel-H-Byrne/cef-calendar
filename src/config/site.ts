/**
 * Single source of truth for the app's brand identity.
 * Used by page metadata, the web app manifest, structured data, the footer,
 * the header, and the generated .ics feeds so the name never drifts.
 */

const FALLBACK_SITE_URL = 'https://cef-calendar.vercel.app';

/**
 * Canonical public URL. Set NEXT_PUBLIC_SITE_URL when a custom domain is attached;
 * otherwise Vercel's production domain is used, then the known production URL.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  return FALLBACK_SITE_URL;
}

export const SITE = {
  /** Product name, used everywhere the app names itself */
  name: 'DC Prince Hall Unified Calendar',
  /** Home-screen label; iOS truncates around 12 characters */
  shortName: 'PH Calendar',
  /** <title> for the home page (kept near 60 characters for search results) */
  title: 'DC Prince Hall Unified Calendar | Masonic Temple Events',
  /** Meta description (~155 characters) */
  description:
    'Live calendar of Prince Hall Masonic events in Washington, DC: MWPHGLDC, Georgiana Thomas Grand Chapter O.E.S., PHFAMOESCEF and CEF THC at 1000 U Street NW.',
  /** Longer description for structured data and the .ics feed */
  longDescription:
    'One live, unified calendar for the Most Worshipful Prince Hall Grand Lodge of DC (MWPHGLDC), Georgiana Thomas Grand Chapter O.E.S., PHFAMOESCEF and the CEF Title Holding Company at the Prince Hall Masonic Temple, 1000 U Street NW, Washington, DC. Subscribe from Apple Calendar, Google Calendar or Outlook.',
  url: resolveSiteUrl(),
  locale: 'en_US',
  language: 'en-US',
  /** Brand colors (navy header, gold accents) */
  colors: {
    navy: '#0B2545',
    gold: '#D4AF37',
  },
  keywords: [
    'Prince Hall',
    'Prince Hall Masonic Temple',
    'MWPHGLDC',
    'Georgiana Thomas Grand Chapter',
    'Order of the Eastern Star',
    'PHFAMOESCEF',
    'Washington DC Masonic events',
    '1000 U Street NW',
    'Masonic calendar',
  ],
  address: {
    street: '1000 U Street NW',
    city: 'Washington',
    region: 'DC',
    postalCode: '20001',
    country: 'US',
  },
  /** Studio that designed and built the app */
  builder: {
    name: 'Ten K Solutions, LLC',
    url: 'https://www.tenksolutions.com',
  },
} as const;

/** Name and description stamped into the generated .ics feeds */
export const ICS_BRAND = {
  prodId: '-//Ten K Solutions//DC Prince Hall Unified Calendar//EN',
  name: SITE.name,
  description:
    'Unified schedule for MWPHGLDC, Georgiana Thomas Grand Chapter O.E.S., PHFAMOESCEF, and CEF THC.',
} as const;
