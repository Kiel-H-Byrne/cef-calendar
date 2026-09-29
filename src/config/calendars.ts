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
    color: { primary: '#003366', secondary: '#D4AF37', text: '#ffffff' }, // Royal Masonic Blue & Imperial Gold (Contrast: 10.7:1)
  },
  {
    id: 'org-beta',
    name: 'PHFAMOESCEF',
    shortName: 'phfamoescef',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_BETA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/7bfa71fa1f754f829b6a73c594bd24fb@phfamoescef.org/b07efc814e764250a08f308278edd82118280917116044950697/calendar.ics',
    color: { primary: '#6B21A8', secondary: '#D4AF37', text: '#ffffff' }, // Regal Purple / Foundation & Endowment (Contrast: 8.5:1)
  },
  {
    id: 'org-gamma',
    name: 'CEF THC - Temple Holding',
    shortName: 'thc',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_GAMMA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/0c65f07100374ca48d3737339b79d615%40phfamoescef.org/b8db7fd7e1d740f284f071e755d6071b1585401539968367440/calendar.ics',
    color: { primary: '#047857', secondary: '#10B981', text: '#ffffff' }, // Historic Temple Stewardship Emerald (Contrast: 5.2:1)
  },
  {
    id: 'org-delta',
    name: 'GTGC - Eastern Star',
    shortName: 'gtgc',
    sourceType: 'outlook',
    icsUrl:
      process.env.CAL_DELTA_ICS_URL ||
      'https://outlook.office365.com/owa/calendar/d077a94286064327a13905b7a6cb44c8@phfamoescef.org/e1cba4c7ef0746f49d26b0b0fa348aee8543287157844258083/calendar.ics',
    color: { primary: '#BE123C', secondary: '#D4AF37', text: '#ffffff' }, // OES Crimson Star (Contrast: 5.4:1)
  },
  {
    id: 'org-epsilon',
    name: 'MWPHGLDC - Orgs',
    shortName: 'mwphgldco',
    sourceType: 'google',
    icsUrl:
      process.env.CAL_EPSILON_ICS_URL ||
      'https://calendar.google.com/calendar/ical/fds5su6fa5uvt2nrtghso263i4%40group.calendar.google.com/public/basic.ics',
    color: { primary: '#1D4ED8', secondary: '#60A5FA', text: '#ffffff' }, // Vibrant Sapphire Blue / Constituent Lodges (Contrast: 5.5:1)
  },
  {
    id: 'org-zeta',
    name: 'MWPHGLDC - Rooms (1000 U St)',
    shortName: 'mwphgldcr',
    sourceType: 'google',
    icsUrl:
      process.env.CAL_ZETA_ICS_URL ||
      'https://calendar.google.com/calendar/ical/8ukripg747ps7c93h6nnflnrp4%40group.calendar.google.com/public/basic.ics',
    color: { primary: '#334155', secondary: '#D4AF37', text: '#ffffff' }, // Architectural Slate / Facilities Reservations (Contrast: 7.1:1)
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
