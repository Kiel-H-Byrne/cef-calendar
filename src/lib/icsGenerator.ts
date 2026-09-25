import { UnifiedCalendarEvent } from '@/config/calendars';

/**
 * Escapes characters for RFC 5545 text fields
 */
export function escapeIcsText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/**
 * Formats a Date or ISO string into RFC 5545 UTC timestamp format (YYYYMMDDTHHMMSSZ)
 */
export function formatIcsDateTimeUtc(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return '19700101T000000Z';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Formats a YYYY-MM-DD or Date into RFC 5545 date-only format (YYYYMMDD)
 */
export function formatIcsDateOnly(dateInput: string | Date): string {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput.replace(/-/g, '');
  }
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return '19700101';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/**
 * Generates a complete, valid RFC 5545 combined .ics calendar string
 */
export function generateMasterIcs(
  events: UnifiedCalendarEvent[],
  calendarName = 'Community Unified Calendar',
  calendarDesc = 'Aggregated community events from non-profit partner organizations'
): string {
  const nowStamp = formatIcsDateTimeUtc(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Community Calendar Overlay Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALDESC:${escapeIcsText(calendarDesc)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@community-calendar.hub`);
    lines.push(`DTSTAMP:${nowStamp}`);

    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDateOnly(event.start)}`);
      // If end is provided, use it; otherwise default to start date
      lines.push(`DTEND;VALUE=DATE:${formatIcsDateOnly(event.end || event.start)}`);
    } else {
      lines.push(`DTSTART:${formatIcsDateTimeUtc(event.start)}`);
      lines.push(`DTEND:${formatIcsDateTimeUtc(event.end || event.start)}`);
    }

    lines.push(`SUMMARY:[${escapeIcsText(event.orgName)}] ${escapeIcsText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    lines.push(`CATEGORIES:${escapeIcsText(event.orgName)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // RFC 5545 requires CRLF line endings
  return lines.join('\r\n') + '\r\n';
}

/**
 * Generates an RFC 5545 .ics payload for a single individual event download
 */
export function generateSingleEventIcs(event: UnifiedCalendarEvent): string {
  return generateMasterIcs(
    [event],
    event.title,
    `Event organized by ${event.orgName}`
  );
}

/**
 * Generates a direct Google Calendar web template link
 */
export function getGoogleCalendarUrl(event: UnifiedCalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  let datesParam: string;
  if (event.allDay) {
    const startYMD = formatIcsDateOnly(event.start);
    const endYMD = formatIcsDateOnly(event.end || event.start);
    datesParam = `${startYMD}/${endYMD}`;
  } else {
    const startUTC = formatIcsDateTimeUtc(event.start);
    const endUTC = formatIcsDateTimeUtc(event.end || event.start);
    datesParam = `${startUTC}/${endUTC}`;
  }

  const detailsText = `${event.description ? event.description + '\n\n' : ''}Organized by: ${event.orgName}`;

  const params = new URLSearchParams({
    text: `[${event.orgName}] ${event.title}`,
    dates: datesParam,
    details: detailsText,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `${baseUrl}&${params.toString()}`;
}
