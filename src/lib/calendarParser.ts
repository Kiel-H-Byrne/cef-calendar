import * as ical from 'node-ical';
import { OrgCalendarConfig, UnifiedCalendarEvent } from '@/config/calendars';

export interface ParseCalendarOptions {
  windowStart?: Date;
  windowEnd?: Date;
}

export interface ParseResult {
  events: UnifiedCalendarEvent[];
  warnings: string[];
}

/**
 * Safely extracts raw string from node-ical fields which might be string or { val, params }
 */
export function extractIcsString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'val' in val) {
    return String(val.val || '');
  }
  return String(val);
}

/**
 * Format date as YYYY-MM-DD for all-day events to prevent timezone displacement
 */
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check whether an occurrence date is in the EXDATE list
 */
function isDateExcluded(
  exdate: any,
  dateYMD: string,
  dateISO: string,
  occDate: Date
): boolean {
  if (!exdate) return false;

  // exdate can be a map { 'YYYY-MM-DD': Date } or an array or single Date
  if (typeof exdate === 'object') {
    if (exdate[dateYMD] || exdate[dateISO]) return true;

    // Check values if object keys are arbitrary
    for (const key of Object.keys(exdate)) {
      const val = exdate[key];
      if (val instanceof Date) {
        if (Math.abs(val.getTime() - occDate.getTime()) < 60000) return true;
        if (formatDateYMD(val) === dateYMD) return true;
      }
    }
  }
  return false;
}

/**
 * Retrieve any override event from the recurrences map for a specific date
 */
function findRecurrenceOverride(
  recurrences: any,
  dateYMD: string,
  dateISO: string,
  occDate: Date
): any | null {
  if (!recurrences || typeof recurrences !== 'object') return null;

  // Direct lookup
  if (recurrences[dateYMD]) return recurrences[dateYMD];
  if (recurrences[dateISO]) return recurrences[dateISO];

  // Fuzzy match on timestamp
  for (const key of Object.keys(recurrences)) {
    const item = recurrences[key];
    if (item && item.start instanceof Date) {
      if (Math.abs(item.start.getTime() - occDate.getTime()) < 60000) {
        return item;
      }
      if (formatDateYMD(item.start) === dateYMD) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Unescapes RFC 5545 text strings
 */
export function unescapeIcsText(input: any): string {
  const text = extractIcsString(input);
  if (!text) return '';
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/**
 * Parses raw iCalendar text into normalized UnifiedCalendarEvents
 */
export function parseIcsContent(
  icsData: string,
  source: OrgCalendarConfig,
  options?: ParseCalendarOptions
): ParseResult {
  const warnings: string[] = [];
  const events: UnifiedCalendarEvent[] = [];

  // Default rolling window: -30 days to +180 days from now
  const now = new Date();
  const windowStart =
    options?.windowStart || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const windowEnd =
    options?.windowEnd || new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  let parsed: ical.CalendarResponse;
  try {
    parsed = ical.parseICS(icsData);
  } catch (err: any) {
    warnings.push(
      `Failed to parse iCal feed for ${source.name} (${source.id}): ${err?.message || String(err)}`
    );
    return { events, warnings };
  }

  for (const key of Object.keys(parsed)) {
    const item = parsed[key];
    if (!item || item.type !== 'VEVENT') continue;

    const vEvent = item as ical.VEvent;

    // Check if event is all-day
    const isAllDay =
      (vEvent.start as any)?.dateOnly === true ||
      (vEvent as any).datetype === 'date';

    const title = unescapeIcsText(vEvent.summary) || '(Untitled Event)';
    const description = unescapeIcsText(vEvent.description) || undefined;
    const location = unescapeIcsText(vEvent.location) || undefined;

    const baseUid = vEvent.uid || `event-${Math.random().toString(36).substring(2, 9)}`;

    // Handle recurring event
    if (vEvent.rrule) {
      try {
        const baseDurationMs =
          vEvent.start && vEvent.end
            ? vEvent.end.getTime() - vEvent.start.getTime()
            : isAllDay
            ? 24 * 60 * 60 * 1000
            : 60 * 60 * 1000;

        const handledOverrideKeys = new Set<string>();

        // Generate occurrences within window
        const occurrences = vEvent.rrule.between(windowStart, windowEnd, true);

        for (const occDate of occurrences) {
          const dateYMD = formatDateYMD(occDate);
          const dateISO = occDate.toISOString();

          // Check if excluded
          if (isDateExcluded(vEvent.exdate, dateYMD, dateISO, occDate)) {
            continue;
          }

          // Check for recurrence override (modified instance)
          const override = findRecurrenceOverride(
            vEvent.recurrences,
            dateYMD,
            dateISO,
            occDate
          );

          if (override && override.type === 'VEVENT') {
            const overStart: Date =
              override.start instanceof Date ? override.start : occDate;
            const overEnd: Date =
              override.end instanceof Date
                ? override.end
                : new Date(overStart.getTime() + baseDurationMs);

            const overIsAllDay =
              (overStart as any)?.dateOnly === true ||
              override.datetype === 'date';

            const startStr = overIsAllDay
              ? formatDateYMD(overStart)
              : overStart.toISOString();
            const endStr = overIsAllDay
              ? formatDateYMD(overEnd)
              : overEnd.toISOString();

            events.push({
              id: `${baseUid}_${dateYMD}_override`,
              orgId: source.id,
              orgName: source.name,
              title: unescapeIcsText(override.summary) || title,
              start: startStr,
              end: endStr,
              allDay: overIsAllDay,
              location: unescapeIcsText(override.location) || location,
              description:
                unescapeIcsText(override.description) || description,
              backgroundColor: source.color.primary,
              borderColor: source.color.secondary,
              textColor: source.color.text,
            });

            handledOverrideKeys.add(dateYMD);
            handledOverrideKeys.add(dateISO);
          } else {
            // Standard occurrence
            const occEnd = new Date(occDate.getTime() + baseDurationMs);
            const startStr = isAllDay
              ? formatDateYMD(occDate)
              : occDate.toISOString();
            const endStr = isAllDay
              ? formatDateYMD(occEnd)
              : occEnd.toISOString();

            events.push({
              id: `${baseUid}_${dateYMD}`,
              orgId: source.id,
              orgName: source.name,
              title,
              start: startStr,
              end: endStr,
              allDay: isAllDay,
              location,
              description,
              backgroundColor: source.color.primary,
              borderColor: source.color.secondary,
              textColor: source.color.text,
            });
          }
        }

        // Also check if any overrides in recurrences exist that weren't captured by between()
        if (vEvent.recurrences) {
          for (const [rKey, recItem] of Object.entries(vEvent.recurrences)) {
            const vRecItem = recItem as any;
            if (
              !handledOverrideKeys.has(rKey) &&
              vRecItem &&
              vRecItem.type === 'VEVENT' &&
              vRecItem.start instanceof Date
            ) {
              const recStart: Date = vRecItem.start;
              if (recStart >= windowStart && recStart <= windowEnd) {
                const recEnd: Date =
                  vRecItem.end instanceof Date
                    ? vRecItem.end
                    : new Date(recStart.getTime() + baseDurationMs);

                const recAllDay =
                  vRecItem.start?.dateOnly === true ||
                  vRecItem.datetype === 'date';

                events.push({
                  id: `${baseUid}_${formatDateYMD(recStart)}_rec`,
                  orgId: source.id,
                  orgName: source.name,
                  title: unescapeIcsText(vRecItem.summary) || title,
                  start: recAllDay
                    ? formatDateYMD(recStart)
                    : recStart.toISOString(),
                  end: recAllDay
                    ? formatDateYMD(recEnd)
                    : recEnd.toISOString(),
                  allDay: recAllDay,
                  location: unescapeIcsText(vRecItem.location) || location,
                  description:
                    unescapeIcsText(vRecItem.description) || description,
                  backgroundColor: source.color.primary,
                  borderColor: source.color.secondary,
                  textColor: source.color.text,
                });
              }
            }
          }
        }
      } catch (rErr: any) {
        warnings.push(
          `Error expanding recurrence for event "${title}" in ${source.name}: ${rErr?.message || String(rErr)}`
        );
      }
    } else {
      // Standalone (non-recurring) event
      if (!vEvent.start || !(vEvent.start instanceof Date)) {
        warnings.push(
          `Event "${title}" (${baseUid}) in ${source.name} skipped: Missing or invalid start date`
        );
        continue;
      }

      const startDate: Date = vEvent.start;
      const endDate: Date =
        vEvent.end instanceof Date
          ? vEvent.end
          : isAllDay
          ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
          : new Date(startDate.getTime() + 60 * 60 * 1000);

      // Check if event overlaps the window
      if (endDate >= windowStart && startDate <= windowEnd) {
        const startStr = isAllDay
          ? formatDateYMD(startDate)
          : startDate.toISOString();
        const endStr = isAllDay
          ? formatDateYMD(endDate)
          : endDate.toISOString();

        events.push({
          id: `${baseUid}_${startStr}`,
          orgId: source.id,
          orgName: source.name,
          title,
          start: startStr,
          end: endStr,
          allDay: isAllDay,
          location,
          description,
          backgroundColor: source.color.primary,
          borderColor: source.color.secondary,
          textColor: source.color.text,
        });
      }
    }
  }

  // Sort events by start date ascending
  events.sort((a, b) => (a.start > b.start ? 1 : a.start < b.start ? -1 : 0));

  return { events, warnings };
}
