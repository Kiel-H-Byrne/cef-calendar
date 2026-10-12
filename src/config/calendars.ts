export interface OrgCalendarConfig {
  id: string;
  name: string;
  shortName: string;
  sourceType: "outlook" | "google";
  icsUrl: string; // Stored via process.env fallback or explicit config
  color: {
    primary: string; // Event background & pill badge
    secondary: string; // Border or hover tone
    text: string; // Contrast text color
  };
}

export const CALENDAR_SOURCES: OrgCalendarConfig[] = [
  {
    id: "org-alpha",
    name: "The MWPHGLDC - Jurisdictional",
    shortName: "mwphgldc",
    sourceType: "google",
    icsUrl:
      process.env.CAL_ALPHA_ICS_URL ||
      "https://calendar.google.com/calendar/ical/riug200q7u4vj7dsb1qus4bij0%40group.calendar.google.com/public/basic.ics",
    color: { primary: "#003366", secondary: "#002244", text: "#ffffff" }, // Royal Masonic Blue
  },
  {
    id: "org-beta",
    name: "PHFAMOESCEF",
    shortName: "phfamoescef",
    sourceType: "outlook",
    icsUrl:
      process.env.CAL_BETA_ICS_URL ||
      "https://outlook.office365.com/owa/calendar/529b87f414144c8d9b13d2b00bc496d0@phfamoescef.org/9373d74ae62f4813a804376128256ba711959120867787912753/calendar.ics",
    color: { primary: "#6B21A8", secondary: "#581C87", text: "#ffffff" }, // Regal Purple / Foundation
  },
  {
    id: "org-gamma",
    name: "CEF THC - Title Holding Company",
    shortName: "thc",
    sourceType: "outlook",
    icsUrl:
      process.env.CAL_GAMMA_ICS_URL ||
      "https://outlook.office365.com/owa/calendar/a1756b60667440c7b8da3fbd8a416f86@phfamoescef.org/781933d90c08402782f94d79e66cd6ab18354436866183602035/calendar.ics",
    color: { primary: "#047857", secondary: "#065F46", text: "#ffffff" }, // Historic Temple Stewardship Emerald
  },
  {
    id: "org-delta",
    name: "GTGC - Eastern Star",
    shortName: "gtgc",
    sourceType: "outlook",
    icsUrl:
      process.env.CAL_DELTA_ICS_URL ||
      "https://outlook.office365.com/owa/calendar/e6c940ff9516447b87f7a9e7799c3f08@phfamoescef.org/6ba280b1e8a44faeac1a89fc9453bf0815357297715037404933/calendar.ics",
    color: { primary: "#BE123C", secondary: "#9F1239", text: "#ffffff" }, // OES Crimson Star
  },
  {
    id: "org-epsilon",
    name: "MWPHGLDC - Orgs",
    shortName: "mwphgldco",
    sourceType: "google",
    icsUrl:
      process.env.CAL_EPSILON_ICS_URL ||
      "https://calendar.google.com/calendar/ical/fds5su6fa5uvt2nrtghso263i4%40group.calendar.google.com/public/basic.ics",
    color: { primary: "#1D4ED8", secondary: "#1E40AF", text: "#ffffff" }, // Vibrant Sapphire Blue / Constituent Lodges
  },
  {
    id: "org-zeta",
    name: "MWPHGLDC - Rooms (1000 U St)",
    shortName: "mwphgldcr",
    sourceType: "google",
    icsUrl:
      process.env.CAL_ZETA_ICS_URL ||
      "https://calendar.google.com/calendar/ical/8ukripg747ps7c93h6nnflnrp4%40group.calendar.google.com/public/basic.ics",
    color: { primary: "#334155", secondary: "#1E293B", text: "#ffffff" }, // Architectural Slate / Facilities Reservations
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
      console.warn(
        "Failed to parse CALENDARS_JSON env variable; falling back to CALENDAR_SOURCES",
        e,
      );
    }
  }

  // Dynamically re-evaluate environment variables to support runtime hot-swaps
  return CALENDAR_SOURCES.map((src) => {
    let dynamicUrl = src.icsUrl;
    if (src.id === "org-alpha" && process.env.CAL_ALPHA_ICS_URL)
      dynamicUrl = process.env.CAL_ALPHA_ICS_URL;
    if (src.id === "org-beta" && process.env.CAL_BETA_ICS_URL)
      dynamicUrl = process.env.CAL_BETA_ICS_URL;
    if (src.id === "org-gamma" && process.env.CAL_GAMMA_ICS_URL)
      dynamicUrl = process.env.CAL_GAMMA_ICS_URL;
    if (src.id === "org-delta" && process.env.CAL_DELTA_ICS_URL)
      dynamicUrl = process.env.CAL_DELTA_ICS_URL;
    if (src.id === "org-epsilon" && process.env.CAL_EPSILON_ICS_URL)
      dynamicUrl = process.env.CAL_EPSILON_ICS_URL;
    if (src.id === "org-zeta" && process.env.CAL_ZETA_ICS_URL)
      dynamicUrl = process.env.CAL_ZETA_ICS_URL;

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

/**
 * Health of one calendar feed, safe to show end users:
 * - ok:          events are live from the feed
 * - stale:       the feed couldn't be reached; events are the last real copy we fetched (`asOf`)
 * - unavailable: the feed couldn't be reached and there is no real copy; no events are shown
 * - sample:      bundled test data (development only, never produced in production)
 */
export type FeedState = "ok" | "stale" | "unavailable" | "sample";

export interface FeedStatus {
  orgId: string;
  orgName: string;
  state: FeedState;
  /** ISO time of the last successful fetch behind the events shown (stale only) */
  asOf?: string;
}

export interface EventsApiResponse {
  events: UnifiedCalendarEvent[];
  sources: OrgCalendarConfig[];
  feedStatus: FeedStatus[];
  lastUpdated: string;
}
