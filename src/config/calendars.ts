export interface OrgCalendarConfig {
  id: string;
  name: string;
  shortName: string;
  sourceType: 'outlook' | 'google';
  icsUrl: string; // Stored via process.env fallback or explicit config
  color: {
    primary: string; // Event background & pill badge
    secondary: string; // Border or hover tone
    text: string; // Contrast text color
  };
}

export const CALENDAR_SOURCES: OrgCalendarConfig[] = [
  {
    id: 'org-alpha',
    name: 'The MWPHGLDC - Jurisdictional',
    shortName: 'mwphgldc',
    sourceType: 'google',
    icsUrl:
      process.env.CAL_ALPHA_ICS_URL ||
      'https://calendar.google.com/calendar/ical/riug200q7u4vj7dsb1qus4bij0%40group.calendar.google.com/public/basic.ics',
    color: { primary: '#381CC9', secondary: '#2a1499', text: '#ffffff' },
  },
  {
    id: 'org-beta',
    name: 'PHFAMOESCEF',
    shortName: 'phfamoescef',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_BETA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/7bfa71fa1f754f829b6a73c594bd24fb@phfamoescef.org/b07efc814e764250a08f308278edd82118280917116044950697/calendar.ics',
    color: { primary: '#81052C', secondary: '#610321', text: '#ffffff' },
  },
  {
    id: 'org-gamma',
    name: 'CEF THC',
    shortName: 'thc',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_GAMMA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/0c65f07100374ca48d3737339b79d615%40phfamoescef.org/b8db7fd7e1d740f284f071e755d6071b1585401539968367440/calendar.ics',
    color: { primary: '#0D9488', secondary: '#0F766E', text: '#ffffff' },
  },
  {
    id: 'org-delta',
    name: 'GTGC',
    shortName: 'gtgc',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_DELTA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/d077a94286064327a13905b7a6cb44c8@phfamoescef.org/e1cba4c7ef0746f49d26b0b0fa348aee8543287157844258083/calendar.ics',
    color: { primary: '#D97706', secondary: '#B45309', text: '#ffffff' },
  },
  {
    id: 'org-epsilon',
    name: 'MWPHGLDC - Orgs',
    shortName: 'mwphgldco',
    sourceType: 'google',
    icsUrl:
      process.env.CAL_EPSILON_ICS_URL ||
      'https://calendar.google.com/calendar/ical/fds5su6fa5uvt2nrtghso263i4%40group.calendar.google.com/public/basic.ics',
    color: { primary: '#06d988', secondary: '#b4ab09', text: '#000000' },
  },
  {
    id: 'org-zeta',
    name: 'MWPHGLDC - Rooms',
    shortName: 'mwphgldcr',
    sourceType: 'google',
    icsUrl:
      process.env.CAL_ZETA_ICS_URL ||
      'https://calendar.google.com/calendar/ical/8ukripg747ps7c93h6nnflnrp4%40group.calendar.google.com/public/basic.ics',
    color: { primary: '#a8d906', secondary: '#0cb409', text: '#000000' },
  },
];

/**
 * Dynamically resolves calendar sources at request time.
 * Supports hot-swapping or adding sources via CALENDARS_JSON environment variable
 * or dynamic process.env values without requiring a full code rebuild.
 */
export function getCalendarSources(): OrgCalendarConfig[] {
  // Check if a dynamic JSON configuration is injected via env
  if (process.env.CALENDARS_JSON) {
    try {
      const parsed = JSON.parse(process.env.CALENDARS_JSON);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse CALENDARS_JSON env variable; falling back to CALENDAR_SOURCES', e);
    }
  }

  // Dynamically re-evaluate environment variables to support runtime hot-swaps
  return CALENDAR_SOURCES.map((src) => {
    let dynamicUrl = src.icsUrl;
    if (src.id === 'org-alpha' && process.env.CAL_ALPHA_ICS_URL) dynamicUrl = process.env.CAL_ALPHA_ICS_URL;
    if (src.id === 'org-beta' && process.env.CAL_BETA_ICS_URL) dynamicUrl = process.env.CAL_BETA_ICS_URL;
    if (src.id === 'org-gamma' && process.env.CAL_GAMMA_ICS_URL) dynamicUrl = process.env.CAL_GAMMA_ICS_URL;
    if (src.id === 'org-delta' && process.env.CAL_DELTA_ICS_URL) dynamicUrl = process.env.CAL_DELTA_ICS_URL;
    if (src.id === 'org-epsilon' && process.env.CAL_EPSILON_ICS_URL) dynamicUrl = process.env.CAL_EPSILON_ICS_URL;
    if (src.id === 'org-zeta' && process.env.CAL_ZETA_ICS_URL) dynamicUrl = process.env.CAL_ZETA_ICS_URL;

    return {
      ...src,
      icsUrl: dynamicUrl,
    };
  });
}

export interface UnifiedCalendarEvent {
  id: string;
  orgId: string;
  orgName: string;
  title: string;
  start: string; // ISO 8601 UTC or YYYY-MM-DD for all-day
  end: string; // ISO 8601 UTC or YYYY-MM-DD for all-day
  allDay: boolean;
  location?: string;
  description?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface EventsApiResponse {
  events: UnifiedCalendarEvent[];
  sources: OrgCalendarConfig[];
  warnings: string[];
  lastUpdated: string;
}
