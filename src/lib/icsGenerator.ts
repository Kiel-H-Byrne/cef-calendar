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
 * Advances a YYYYMMDD date string by 1 day (for exclusive DTEND on all-day events)
 */
function advanceDay(ymd: string): string {
  const y = parseInt(ymd.slice(0, 4), 10);
  const m = parseInt(ymd.slice(4, 6), 10) - 1;
  const d = parseInt(ymd.slice(6, 8), 10);
  const next = new Date(Date.UTC(y, m, d + 1));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
}

/**
 * Folds a single content line to 75 octets max as required by RFC 5545 Section 3.1
 */
export function foldIcsLine(line: string): string {
  // Check UTF-8 byte length
  if (Buffer.byteLength(line, 'utf8') <= 75) {
    return line;
  }
  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = Buffer.byteLength(char, 'utf8');
    const limit = chunks.length === 0 ? 75 : 74; // Account for leading space on continuation lines
    if (currentBytes + charBytes > limit) {
      chunks.push(current);
      current = ' ' + char;
      currentBytes = 1 + charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.join('\r\n');
}

/**
 * Generates a complete, valid RFC 5545 combined .ics calendar string
 */
export function generateMasterIcs(
  events: UnifiedCalendarEvent[],
  calendarName = 'Prince Hall Masonic Temple & Jurisdictional Calendar',
  calendarDesc = 'Unified Jurisdictional Schedule for MWPHGLDC, GTGC, PHFAMOESCEF, and THC'
): string {
  const nowStamp = formatIcsDateTimeUtc(new Date());

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PHFAMOESCEF//Jurisdictional Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-CALDESC:${escapeIcsText(calendarDesc)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const event of events) {
    rawLines.push('BEGIN:VEVENT');

    // Clean UID ensuring single @ domain
    const cleanId = String(event.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    rawLines.push(`UID:${cleanId}@phfamoescef.com`);
    rawLines.push(`DTSTAMP:${nowStamp}`);

    if (event.allDay) {
      const startYMD = formatIcsDateOnly(event.start);
      let endYMD = event.end ? formatIcsDateOnly(event.end) : '';
      // RFC 5545: DTEND is exclusive for DATE values; must be strictly > DTSTART
      if (!endYMD || endYMD <= startYMD) {
        endYMD = advanceDay(startYMD);
      }
      rawLines.push(`DTSTART;VALUE=DATE:${startYMD}`);
      rawLines.push(`DTEND;VALUE=DATE:${endYMD}`);
    } else {
      const startUtc = formatIcsDateTimeUtc(event.start);
      let endUtc = event.end ? formatIcsDateTimeUtc(event.end) : '';
      if (!endUtc || endUtc <= startUtc) {
        const startDate = new Date(event.start);
        const nextHour = new Date(startDate.getTime() + 60 * 60 * 1000);
        endUtc = formatIcsDateTimeUtc(nextHour);
      }
      rawLines.push(`DTSTART:${startUtc}`);
      rawLines.push(`DTEND:${endUtc}`);
    }

    rawLines.push(`SUMMARY:[${escapeIcsText(event.orgName)}] ${escapeIcsText(event.title)}`);

    if (event.description) {
      rawLines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }

    if (event.location) {
      rawLines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    rawLines.push(`CATEGORIES:${escapeIcsText(event.orgName)}`);
    rawLines.push('STATUS:CONFIRMED');
    rawLines.push('TRANSP:OPAQUE');
    rawLines.push('END:VEVENT');
  }

  rawLines.push('END:VCALENDAR');

  // Apply RFC 5545 line folding and CRLF endings
  return rawLines.map(foldIcsLine).join('\r\n') + '\r\n';
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
    let endYMD = event.end ? formatIcsDateOnly(event.end) : '';
    if (!endYMD || endYMD <= startYMD) {
      endYMD = advanceDay(startYMD);
    }
    datesParam = `${startYMD}/${endYMD}`;
  } else {
    const startUTC = formatIcsDateTimeUtc(event.start);
    let endUTC = event.end ? formatIcsDateTimeUtc(event.end) : '';
    if (!endUTC || endUTC <= startUTC) {
      const startDate = new Date(event.start);
      const nextHour = new Date(startDate.getTime() + 60 * 60 * 1000);
      endUTC = formatIcsDateTimeUtc(nextHour);
    }
    datesParam = `${startUTC}/${endUTC}`;
  }

  const detailsText = `${event.description ? event.description + '\n\n' : ''}Organized by: ${event.orgName}\nJurisdiction: Most Worshipful Prince Hall Grand Lodge of DC / GTGC`;

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
