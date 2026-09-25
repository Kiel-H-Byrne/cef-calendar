import { CALENDAR_SOURCES, OrgCalendarConfig, UnifiedCalendarEvent } from '@/config/calendars';
import { MOCK_ICS_FEEDS } from '@/mock-data/mockFeeds';
import { parseIcsContent, ParseCalendarOptions } from './calendarParser';

export interface FeedFetchResult {
  source: OrgCalendarConfig;
  events: UnifiedCalendarEvent[];
  warnings: string[];
  isFallback: boolean;
}

export interface AggregatedFeedsResult {
  events: UnifiedCalendarEvent[];
  sources: OrgCalendarConfig[];
  warnings: string[];
  lastUpdated: string;
}

/**
 * Determines whether a given URL is a placeholder/template URL rather than a live configured URL
 */
export function isPlaceholderUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('...') ||
    lower.includes('example.com') ||
    lower.includes('reachcalendar.ics') && lower.includes('...') ||
    lower.trim() === ''
  );
}

/**
 * Fetches and parses a single calendar feed with Next.js ISR caching and resilient error handling
 */
export async function fetchCalendarFeed(
  source: OrgCalendarConfig,
  options?: ParseCalendarOptions
): Promise<FeedFetchResult> {
  const warnings: string[] = [];
  let rawIcsText = '';
  let isFallback = false;

  const url = source.icsUrl;

  if (isPlaceholderUrl(url)) {
    // URL is a placeholder; use bundled mock feed
    rawIcsText = MOCK_ICS_FEEDS[source.id] || '';
    isFallback = true;
    if (!rawIcsText) {
      warnings.push(`Feed for ${source.name} (${source.id}) has a placeholder URL and no fallback feed was found.`);
    }
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second network timeout

      const response = await fetch(url, {
        next: { revalidate: 900 }, // 15-minute ISR cache
        signal: controller.signal,
        headers: {
          'User-Agent': 'Community-Calendar-Overlay-Hub/1.0 (+https://github.com)',
          Accept: 'text/calendar, text/plain, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      rawIcsText = await response.text();

      if (!rawIcsText || !rawIcsText.includes('BEGIN:VCALENDAR')) {
        throw new Error('Received payload is not a valid iCalendar feed');
      }
    } catch (err: any) {
      const errorMsg = err?.name === 'AbortError' ? 'Request timed out after 8s' : err?.message || String(err);
      warnings.push(`Failed to fetch ${source.name} feed from ${url}: ${errorMsg}`);

      // Graceful fallback to mock data if available
      if (MOCK_ICS_FEEDS[source.id]) {
        rawIcsText = MOCK_ICS_FEEDS[source.id];
        isFallback = true;
        warnings.push(`Serving cached fallback events for ${source.name}.`);
      }
    }
  }

  if (!rawIcsText) {
    return {
      source,
      events: [],
      warnings,
      isFallback,
    };
  }

  const parseResult = parseIcsContent(rawIcsText, source, options);
  warnings.push(...parseResult.warnings);

  return {
    source,
    events: parseResult.events,
    warnings,
    isFallback,
  };
}

/**
 * Fetches all configured calendar feeds concurrently, aggregating results and isolating failures
 */
export async function fetchAllCalendarFeeds(
  options?: ParseCalendarOptions & { targetOrgId?: string }
): Promise<AggregatedFeedsResult> {
  const sourcesToFetch = options?.targetOrgId
    ? CALENDAR_SOURCES.filter((s) => s.id === options.targetOrgId)
    : CALENDAR_SOURCES;

  // Execute all feed fetches concurrently using Promise.allSettled
  const results = await Promise.allSettled(
    sourcesToFetch.map((src) => fetchCalendarFeed(src, options))
  );

  const aggregatedEvents: UnifiedCalendarEvent[] = [];
  const aggregatedWarnings: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const src = sourcesToFetch[i];

    if (res.status === 'fulfilled') {
      aggregatedEvents.push(...res.value.events);
      aggregatedWarnings.push(...res.value.warnings);
    } else {
      aggregatedWarnings.push(
        `Critical error processing feed for ${src.name}: ${res.reason?.message || String(res.reason)}`
      );
    }
  }

  // Sort chronologically
  aggregatedEvents.sort((a, b) => (a.start > b.start ? 1 : a.start < b.start ? -1 : 0));

  return {
    events: aggregatedEvents,
    sources: CALENDAR_SOURCES,
    warnings: aggregatedWarnings,
    lastUpdated: new Date().toISOString(),
  };
}
