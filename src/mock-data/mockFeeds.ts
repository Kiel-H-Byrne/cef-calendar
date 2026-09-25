export const MOCK_ICS_FEEDS: Record<string, string> = {
  'org-alpha': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//First Organization//Community Healthcare//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Alpha Health Alliance
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:alpha-event-clinic@alpha.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260901T090000
DTEND;TZID=America/New_York:20260901T130000
RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=30
SUMMARY:Walk-in Community Wellness Clinic
DESCRIPTION:Free preventive health screenings, blood pressure checks, and bilingual consultations.\\nNo insurance or appointment required.\\nMore info at: https://alphahealth.org/walkin
LOCATION:Alpha Health Center, 450 Health Parkway, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:alpha-event-blood-drive@alpha.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260903T100000
DTEND;TZID=America/New_York:20260903T160000
RRULE:FREQ=MONTHLY;BYDAY=1TH;COUNT=12
SUMMARY:Monthly Regional Blood Drive
DESCRIPTION:Help save lives in our community! Walk-ins welcome or reserve an hourly slot online: https://alphahealth.org/blooddrive
LOCATION:Alpha Health Center Main Auditorium, 450 Health Parkway, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:alpha-event-pediatric-webinar@alpha.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261008T183000
DTEND;TZID=America/New_York:20261008T200000
SUMMARY:Pediatric Nutrition & Mental Health Webinar
DESCRIPTION:Join Dr. Elena Ramos and pediatric specialists for an interactive Q&A on nutrition and emotional resilience in children.\\nJoin Zoom Meeting: https://zoom.us/j/94827103819\\nPasscode: HEALTH26
LOCATION:https://zoom.us/j/94827103819
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:alpha-event-summit@alpha.org
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261023
DTEND;VALUE=DATE:20261025
SUMMARY:Annual Community Health & Equity Summit
DESCRIPTION:Two-day conference convening regional healthcare providers, grassroots organizers, and public health advocates. Keynotes, workshops, and networking dinner.\\nRegistration: https://alphahealth.org/summit2026
LOCATION:Lincoln Memorial Convention Center, 1 Convention Center Way, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:alpha-event-flu-drive@alpha.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261114T100000
DTEND;TZID=America/New_York:20261114T150000
SUMMARY:Fall Vaccination & Flu Shot Clinic
DESCRIPTION:Drive-thru and walk-up influenza vaccinations for families. High-dose vaccines available for seniors 65+.\\nSponsored by County Public Health.
LOCATION:Lincoln High School South Lot, 701 S 11th St, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-beta': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Second Organization//Youth Empowerment//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Beta Youth Initiative
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:beta-event-tutoring@beta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260902T160000
DTEND;TZID=America/New_York:20260902T183000
RRULE:FREQ=WEEKLY;BYDAY=WE;COUNT=30
SUMMARY:After-School STEM Tutoring & Homework Club
DESCRIPTION:High school and middle school tutoring in mathematics, coding, and physics by university volunteer mentors. Laptops and snacks provided.\\nRegister: https://betayouth.org/tutoring
LOCATION:Beta Youth Innovation Lab, 820 Innovation Blvd, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:beta-event-college-prep@beta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261014T180000
DTEND;TZID=America/New_York:20261014T200000
SUMMARY:College Admissions & Financial Aid Masterclass
DESCRIPTION:Comprehensive workshop covering FAFSA completion, scholarship search strategies, and essay drafting for first-generation college aspirants.\\nJoin Microsoft Teams: https://teams.microsoft.com/l/meetup-join/19%3ameeting_beta_prep
LOCATION:https://teams.microsoft.com/l/meetup-join/19%3ameeting_beta_prep
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:beta-event-robotics-expo@beta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261107T110000
DTEND;TZID=America/New_York:20261107T170000
SUMMARY:Regional Youth Robotics Showcase & Tournament
DESCRIPTION:Over 24 youth teams compete in FIRST Tech Challenge demonstrations. Free admission for community members of all ages.\\nDetails at: https://betayouth.org/robotics2026
LOCATION:Midwest Science Pavilion, 300 Technology Way, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:beta-event-leadership-retreat@beta.org
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261120
DTEND;VALUE=DATE:20261122
SUMMARY:Beta Emerging Youth Leaders Retreat
DESCRIPTION:Weekend leadership development incubator for young civic advocates. Focus on public speaking, project management, and community organizing.
LOCATION:Camp Timberline Lodge, 1200 Lakeview Rd, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-gamma': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Third Organization//Environmental Stewardship//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Gamma Green Ecology
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:gamma-event-garden@gamma.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260905T090000
DTEND;TZID=America/New_York:20260905T120000
RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=SA;COUNT=20
SUMMARY:Community Garden Volunteer Workday
DESCRIPTION:Hands-on organic farming, raised-bed restoration, weeding, and produce harvesting for local food pantries. Bring gardening gloves and a reusable water bottle!\\nSign up: https://gammagreen.org/volunteer
LOCATION:Prairie View Community Garden, 550 Meadow Lane, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:gamma-event-river-cleanup@gamma.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261017T090000
DTEND;TZID=America/New_York:20261017T133000
SUMMARY:Sangamon River Cleanup & Native Habitat Restoration
DESCRIPTION:Annual autumn riverbank cleanup removing plastic debris and planting native wetland grasses. Kayaks and safety gear provided for certified volunteers.\\nMeeting point: Riverside Park Boat Launch.
LOCATION:Riverside Park, 1020 River Drive, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:gamma-event-compost-workshop@gamma.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261027T190000
DTEND;TZID=America/New_York:20261027T201500
SUMMARY:Urban Composting & Zero-Waste Living Virtual Workshop
DESCRIPTION:Learn practical methods to divert food waste, manage indoor vermicomposting, and reduce domestic landfill footprint.\\nJoin Google Meet: https://meet.google.com/abc-wxyz-def
LOCATION:https://meet.google.com/abc-wxyz-def
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:gamma-event-tree-planting@gamma.org
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261114
DTEND;VALUE=DATE:20261115
SUMMARY:Arbor Canopy Planting Blitz: 500 Native Trees
DESCRIPTION:Join 150+ neighborhood volunteers to plant native oak, maple, and dogwood saplings across under-canopied city parks and boulevards.
LOCATION:Lincoln City Park District, 200 Park Blvd, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-delta': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Delta Arts & Heritage Collective
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:delta-event-openmic@delta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260904T193000
DTEND;TZID=America/New_York:20260904T220000
RRULE:FREQ=WEEKLY;BYDAY=FR;COUNT=25
SUMMARY:Acoustic Open Mic & Spoken Word Night
DESCRIPTION:Weekly live showcase for local musicians, poets, and storytellers. Sign-up list opens in person at 7:00 PM. Acoustic instruments only.\\nMore info: https://deltaarts.org/openmic
LOCATION:The Brickhouse Cultural Lounge, 320 E Adams St, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:delta-event-exhibition@delta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261009T180000
DTEND;TZID=America/New_York:20261009T213000
SUMMARY:Autumn Contemporary Gallery Opening: 'Roots & Horizons'
DESCRIPTION:Opening gala for our new exhibition featuring 12 regional minority and diaspora visual artists. Featuring live chamber music and light refreshments.\\nFree admission. RSVP: https://deltaarts.org/exhibitions
LOCATION:Delta Community Art Gallery, 114 S 6th St, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:delta-event-food-festival@delta.org
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261031
DTEND;VALUE=DATE:20261102
SUMMARY:Heritage Food & Global Folk Arts Weekend
DESCRIPTION:Two full days of street food from 20+ immigrant culinary vendors, artisan craft booths, traditional dance stages, and hands-on printmaking workshops.
LOCATION:Downtown Heritage Square, 100 N 5th St, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:delta-event-film-screening@delta.org
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261119T190000
DTEND;TZID=America/New_York:20261119T213000
SUMMARY:Independent Documentary Screening & Filmmaker Panel
DESCRIPTION:Special screening of 'Echoes of the Valley' followed by a live panel discussion with the documentary directors and community elders.\\nTickets: https://deltaarts.org/cinema
LOCATION:Roxy Historic Cinema, 412 E Monroe St, Springfield, IL
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
};
