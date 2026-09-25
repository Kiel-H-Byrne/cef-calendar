# Multi-Calendar Public Overlay Hub

A high-performance, accessible, and responsive unified calendar aggregation platform built with **Next.js 15+ App Router**, **TypeScript**, **Tailwind CSS**, and **FullCalendar**.

Aggregates 4 distinct public iCalendar (`.ics`) feeds (3 from Outlook on the web, 1 from Google Calendar), parses and normalizes them server-side (including recurring instances and overrides), and displays them on an interactive client-side calendar with filtering, color-coding, event detail modals, and subscription capabilities (`webcal://`).

---

## Key Features

- **Server-Side Ingestion & CORS Proxy:** External `.ics` feeds are fetched strictly server-side using native Next.js `fetch` with `next: { revalidate: 900 }` (15-minute ISR cache).
- **Recurrence & Exception Handling:** Expands complex `RRULE` patterns (daily, weekly, monthly, interval-based) across a configurable rolling window, while respecting `EXDATE` exclusions and `RECURRENCE-ID` instance overrides.
- **Timezone & All-Day Accuracy:** Formats all-day events using plain date strings (`YYYY-MM-DD`) with RFC 5545 exclusive boundary adjustments to prevent 1-hour daylight saving or multi-timezone displacement. Timed events are normalized to ISO UTC strings and localized client-side to the user's browser.
- **Fail-Soft Resiliency:** If any remote feed is down, times out, or returns invalid data, the system isolates the failure, serves partial results from operational feeds, logs structured warnings, and falls back to bundled fallback data so the community schedule is never blank.
- **Interactive Multi-View Calendar:**
  - Month Grid (`dayGridMonth`), Week Grid (`timeGridWeek`), and List (`listMonth`) views.
  - Automatically switches to List view on mobile viewports (`< 768px`) for optimal readability.
  - Organization color pills with live event count badges.
  - Real-time search filter by title, location, or description.
  - "Select All" and "Clear All" organization toggles.
- **Detailed Event Modal:**
  - Localized date and time display with explicit timezone abbreviation.
  - Auto-detection of virtual meetings (Zoom, Microsoft Teams, Google Meet) with direct "Join Video Conference" action.
  - Physical addresses linked directly to Google Maps.
  - Sanitized descriptions with auto-linked URLs.
  - 1-click single-event `.ics` download and direct "Add to Google Calendar" web link.
- **Outbound Subscriptions (`webcal://` & RFC 5545):**
  - Combined master subscription feed at `/api/calendar/master.ics`.
  - Individual organization feeds at `/api/calendar/[orgId]`.
  - One-click subscribe for Apple Calendar, Outlook, and Google Calendar.

---

## Architecture & File Structure

```
thcCalendar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calendar/
│   │   │   │   ├── [orgId]/
│   │   │   │   │   └── route.ts         # Dedicated per-org RFC 5545 .ics feed
│   │   │   │   └── master.ics/
│   │   │   │       └── route.ts         # Combined master RFC 5545 .ics subscription
│   │   │   └── events/
│   │   │       └── route.ts             # Server-side ingestion JSON API (/api/events)
│   │   ├── globals.css                  # Theme variables & FullCalendar styling
│   │   ├── layout.tsx                   # Metadata and typography layout
│   │   └── page.tsx                     # ISR pre-rendered home page
│   ├── components/
│   │   ├── CalendarHub.tsx              # Main state coordinator component
│   │   ├── CalendarView.tsx             # Responsive FullCalendar wrapper
│   │   ├── EventModal.tsx               # Accessible event detail modal
│   │   ├── FilterToolbar.tsx            # Org pills, search, and action controls
│   │   ├── Header.tsx                   # Top branding, event counts, and sync status
│   │   └── SubscribeModal.tsx           # Multi-platform subscription drawer
│   ├── config/
│   │   └── calendars.ts                 # Organization definitions, colors, and types
│   ├── lib/
│   │   ├── calendarParser.ts            # node-ical parsing & RRULE expansion engine
│   │   ├── feedFetcher.ts               # Resilient fetcher with 15m ISR caching
│   │   └── icsGenerator.ts              # RFC 5545 calendar and event generator
│   └── mock-data/
│       └── mockFeeds.ts                 # Bundled fallback RFC 5545 sample feeds
├── .env.example                         # Environment configuration template
└── README.md
```

---

## Organization Configuration

Defined in [`src/config/calendars.ts`](file:///C:/Users/KHB/sites/thcCalendar/src/config/calendars.ts):

| Organization | ID | Source Type | Default Color |
| :--- | :--- | :--- | :--- |
| **First Organization** | `org-alpha` | Outlook on the web | Primary: `#381CC9` (Indigo) |
| **Second Organization** | `org-beta` | Outlook on the web | Primary: `#81052C` (Burgundy) |
| **Third Organization** | `org-gamma` | Outlook on the web | Primary: `#0D9488` (Teal) |
| **Fourth Organization** | `org-delta` | Google Calendar | Primary: `#D97706` (Amber) |

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure live remote calendar feeds:

```bash
cp .env.example .env.local
```

```env
# Public Calendar iCal (.ics) Feeds
CAL_ALPHA_ICS_URL="https://outlook.office365.com/owa/calendar/.../reachcalendar.ics"
CAL_BETA_ICS_URL="https://outlook.office365.com/owa/calendar/.../reachcalendar.ics"
CAL_GAMMA_ICS_URL="https://outlook.office365.com/owa/calendar/.../reachcalendar.ics"
CAL_DELTA_ICS_URL="https://calendar.google.com/calendar/ical/.../public/basic.ics"

# Set to "true" to serve realistic bundled sample feeds if URLs are unconfigured or unreachable
ENABLE_MOCK_FALLBACK="true"
```

---

## API Endpoints

### 1. Ingestion Endpoint
- **`GET /api/events`**
  - **Query Params:**
    - `start` *(optional)*: ISO 8601 string for start of recurrence window.
    - `end` *(optional)*: ISO 8601 string for end of recurrence window.
    - `orgId` *(optional)*: Filter events by organization ID.
  - **Response:**
    ```json
    {
      "events": [ ... ],
      "sources": [ ... ],
      "warnings": [ ... ],
      "lastUpdated": "2026-09-22T22:00:00.000Z"
    }
    ```

### 2. Combined Master Feed
- **`GET /api/calendar/master.ics`**
  - **Headers:** `Content-Type: text/calendar; charset=utf-8`, `Content-Disposition: inline; filename="combined-community-calendar.ics"`
  - **Webcal Subscription Link:** `webcal://<host>/api/calendar/master.ics`

### 3. Individual Organization Feed
- **`GET /api/calendar/[orgId]`**
  - Example: `webcal://<host>/api/calendar/org-alpha`

---

## Development & Build Commands

```bash
# Run development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```
