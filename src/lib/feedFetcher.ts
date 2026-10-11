import {
  EventsApiResponse,
  FeedStatus,
  getCalendarSources,
  OrgCalendarConfig,
  UnifiedCalendarEvent,
} from '@/config/calendars';
import { parseIcsContent, ParseCalendarOptions } from './calendarParser';

export interface FeedFetchResult {
  source: OrgCalendarConfig;
  events: UnifiedCalendarEvent[];
  status: FeedStatus;
  /** Server-side only: upstream URLs and error details. Never send these to the browser. */
  diagnostics: string[];
}

export interface AggregatedFeedsResult {
  events: UnifiedCalendarEvent[];
  sources: OrgCalendarConfig[];
  feedStatus: FeedStatus[];
  lastUpdated: string;
  /** Server-side only: logged, never sent to the browser. */
  diagnostics: string[];
}

export interface FetchFeedOptions extends ParseCalendarOptions {
  forceRefresh?: boolean;
}

const FETCH_TIMEOUT_MS = 8000;

/**
 * How long a previously fetched copy of a feed may stand in for a feed that is currently
 * failing. Past this, the feed is reported unavailable rather than showing out-of-date events.
 */
const STALE_FEED_MAX_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Last successfully fetched ICS text per feed (keyed by source id + URL so a replaced calendar
 * link never inherits the old calendar's events). In-memory, so it only covers failures on a
 * server instance that has already seen a good copy.
 */
const lastGoodFeeds = new Map<string, { icsText: string; fetchedAt: number }>();

const lastGoodKey = (source: OrgCalendarConfig) => `${source.id}|${source.icsUrl}`;

/**
 * Bundled sample feeds exist for local development and testing only. They are opt-in and are
 * never used when NODE_ENV is "production" (including Vercel preview deployments), so an
 * end user can never be shown fake events.
 */
function mockFeedsEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_MOCK_FALLBACK === 'true';
}

async function loadMockFeed(sourceId: string): Promise<string | null> {
  if (!mockFeedsEnabled()) return null;
  const { MOCK_ICS_FEEDS } = await import('@/mock-data/mockFeeds');
  return MOCK_ICS_FEEDS[sourceId] ?? null;
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
    (lower.includes('reachcalendar.ics') && lower.includes('...')) ||
    lower.trim() === ''
  );
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    return err.name === 'AbortError' ? `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s` : err.message;
  }
  return String(err);
}

/**
 * Fetches the raw ICS text of one feed with Next.js cache tagging and a network timeout.
 * Throws when the feed can't be reached or doesn't return a calendar.
 */
async function fetchRemoteIcs(source: OrgCalendarConfig, options?: FetchFeedOptions): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Next.js fetch configuration with tag-based revalidation & forceRefresh support
    const fetchInit: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Community-Calendar-Overlay-Hub/1.0 (+https://github.com)',
        Accept: 'text/calendar, text/plain, */*',
      },
    };

    if (options?.forceRefresh) {
      fetchInit.cache = 'no-store';
    } else {
      fetchInit.next = {
        revalidate: 900, // 15-minute ISR cache
        tags: ['calendar-feeds', `calendar-feed-${source.id}`],
      };
    }

    const response = await fetch(source.icsUrl, fetchInit);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const icsText = await response.text();
    // A deleted/moved calendar often answers with an HTML page rather than an error status
    if (!icsText || !icsText.includes('BEGIN:VCALENDAR')) {
      throw new Error('Received payload is not a valid iCalendar feed');
    }
    return icsText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches and parses a single calendar feed, isolating its failures from the other feeds.
 *
 * When the feed can't be fetched: a previously fetched real copy (< 6h old) is shown and flagged
 * `stale`; otherwise the feed contributes no events and is flagged `unavailable`. Fabricated
 * sample data is never substituted outside an explicit local-development opt-in.
 */
export async function fetchCalendarFeed(
  source: OrgCalendarConfig,
  options?: FetchFeedOptions
): Promise<FeedFetchResult> {
  const diagnostics: string[] = [];
  const status: FeedStatus = { orgId: source.id, orgName: source.name, state: 'ok' };
  let icsText: string | null = null;

  if (isPlaceholderUrl(source.icsUrl)) {
    diagnostics.push(`${source.name} (${source.id}) has no calendar URL configured.`);
  } else {
    try {
      icsText = await fetchRemoteIcs(source, options);
      lastGoodFeeds.set(lastGoodKey(source), { icsText, fetchedAt: Date.now() });
    } catch (err: unknown) {
      diagnostics.push(`Failed to fetch ${source.name} (${source.id}) from ${source.icsUrl}: ${describeError(err)}`);

      const lastGood = lastGoodFeeds.get(lastGoodKey(source));
      if (lastGood && Date.now() - lastGood.fetchedAt <= STALE_FEED_MAX_AGE_MS) {
        icsText = lastGood.icsText;
        status.state = 'stale';
        status.asOf = new Date(lastGood.fetchedAt).toISOString();
        diagnostics.push(`Showing the copy of ${source.name} fetched at ${status.asOf}.`);
      }
    }
  }

  if (icsText === null) {
    const sample = await loadMockFeed(source.id);
    if (sample) {
      icsText = sample;
      status.state = 'sample';
      diagnostics.push(`Showing bundled SAMPLE data for ${source.name} (development only).`);
    } else {
      status.state = 'unavailable';
      return { source, events: [], status, diagnostics };
    }
  }

  const parseResult = parseIcsContent(icsText, source, options);
  diagnostics.push(...parseResult.warnings);

  return { source, events: parseResult.events, status, diagnostics };
}

/**
 * Fetches all dynamically resolved calendar feeds concurrently.
 * Reconciles sources dynamically and isolates individual feed failures.
 */
export async function fetchAllCalendarFeeds(
  options?: FetchFeedOptions & { targetOrgId?: string }
): Promise<AggregatedFeedsResult> {
  const allSources = getCalendarSources();
  const sourcesToFetch = options?.targetOrgId
    ? allSources.filter((s) => s.id === options.targetOrgId)
    : allSources;

  // Execute all feed fetches concurrently using Promise.allSettled
  const results = await Promise.allSettled(
    sourcesToFetch.map((src) => fetchCalendarFeed(src, options))
  );

  const aggregatedEvents: UnifiedCalendarEvent[] = [];
  const feedStatus: FeedStatus[] = [];
  const diagnostics: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const src = sourcesToFetch[i];

    if (res.status === 'fulfilled') {
      aggregatedEvents.push(...res.value.events);
      feedStatus.push(res.value.status);
      diagnostics.push(...res.value.diagnostics);
    } else {
      feedStatus.push({ orgId: src.id, orgName: src.name, state: 'unavailable' });
      diagnostics.push(`Unexpected error processing ${src.name} (${src.id}): ${describeError(res.reason)}`);
    }
  }

  if (diagnostics.length > 0) {
    console.warn(`[calendar-feeds] ${diagnostics.join(' | ')}`);
  }

  // Sort chronologically
  aggregatedEvents.sort((a, b) => (a.start > b.start ? 1 : a.start < b.start ? -1 : 0));

  return {
    events: aggregatedEvents,
    sources: allSources,
    feedStatus,
    lastUpdated: new Date().toISOString(),
    diagnostics,
  };
}

/** The browser-safe subset of an aggregate result (drops server-only diagnostics). */
export function toClientPayload(data: AggregatedFeedsResult): EventsApiResponse {
  return {
    events: data.events,
    sources: data.sources,
    feedStatus: data.feedStatus,
    lastUpdated: data.lastUpdated,
  };
}
