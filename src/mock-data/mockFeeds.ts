export const MOCK_ICS_FEEDS: Record<string, string> = {
  'org-alpha': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MWPHGLDC//Jurisdictional Communications//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:The MWPHGLDC - Jurisdictional
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:mwphgldc-stated-comm@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260908T190000
DTEND;TZID=America/New_York:20260908T220000
RRULE:FREQ=MONTHLY;BYDAY=2TU;COUNT=12
SUMMARY:MWPHGLDC Quarterly Jurisdictional Communication
DESCRIPTION:Quarterly Communication for the Most Worshipful Prince Hall Grand Lodge of the District of Columbia. Formal fraternal attire required.
LOCATION:Grand East, Prince Hall Masonic Temple, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:mwphgldc-annual-conv@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261113
DTEND;VALUE=DATE:20261116
SUMMARY:MWPHGLDC Annual Grand Communication
DESCRIPTION:Annual Grand Communication of the Most Worshipful Prince Hall Grand Lodge of DC. Elections, jurisdictional reports, and grand banquet.
LOCATION:Grand Ballroom & Temple Chambers, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:mwphgldc-scholarship-gala@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261024T180000
DTEND;TZID=America/New_York:20261024T220000
SUMMARY:Prince Hall Annual Youth Scholarship & Awards Gala
DESCRIPTION:Celebrating academic excellence and presenting collegiate scholarships to graduating District of Columbia high school seniors.
LOCATION:Prince Hall Masonic Temple, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-beta': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PHFAMOESCEF//Charitable Foundation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PHFAMOESCEF
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:cef-board-meeting@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260915T183000
DTEND;TZID=America/New_York:20260915T203000
RRULE:FREQ=MONTHLY;BYDAY=3TU;COUNT=12
SUMMARY:PHFAMOESCEF Board of Trustees Stated Meeting
DESCRIPTION:Regular governance meeting of the Prince Hall Freemason and Order of the Eastern Star Charitable & Educational Foundation Trustees.
LOCATION:Board Room (Room 204), 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:cef-food-distribution@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260919T090000
DTEND;TZID=America/New_York:20260919T130000
RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=SA;COUNT=16
SUMMARY:U Street Corridor Community Food & Wellness Pantry
DESCRIPTION:Weekly community food distribution in partnership with Capital Area Food Bank and local Ward 1 community partners.
LOCATION:Lower Level Fellowship Hall, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:cef-annual-giving@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;VALUE=DATE:20261201
DTEND;VALUE=DATE:20261202
SUMMARY:Giving Tuesday Jurisdictional Charitable Match Campaign
DESCRIPTION:Annual community fund drive matching individual donations for educational endowments and youth mentoring initiatives.
LOCATION:PHFAMOESCEF Foundation Office & Online at phfamoescef.com
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-gamma': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CEF THC//Title Holding Company//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:CEF THC - Title Holding Company
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:thc-directors-meeting@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260910T180000
DTEND;TZID=America/New_York:20260910T200000
RRULE:FREQ=MONTHLY;BYDAY=2TH;COUNT=12
SUMMARY:CEF THC Board of Directors Facility Review
DESCRIPTION:Monthly oversight meeting covering historic building preservation, capital upgrades, and tenant leasing at 1000 U Street NW.
LOCATION:Executive Conference Suite, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:thc-preservation-inspection@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261005T090000
DTEND;TZID=America/New_York:20261005T150000
SUMMARY:Historic Temple Architectural & Safety Inspection
DESCRIPTION:Biannual structural and historic preservation review of Temple masonry, roof systems, and accessibility access points.
LOCATION:Prince Hall Masonic Temple, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-delta': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GTGC//Georgiana Thomas Grand Chapter OES//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:GTGC - Eastern Star
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:gtgc-stated-session@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260912T100000
DTEND;TZID=America/New_York:20260912T140000
RRULE:FREQ=MONTHLY;BYDAY=2SA;COUNT=12
SUMMARY:GTGC Stated Grand Chapter Session
DESCRIPTION:Monthly fraternal business session of Georgiana Thomas Grand Chapter, Order of the Eastern Star, Prince Hall Affiliation.
LOCATION:Grand Chapter Room, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:gtgc-annual-tea@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20261018T140000
DTEND;TZID=America/New_York:20261018T170000
SUMMARY:GTGC Annual Queen of the South Scholarship Tea
DESCRIPTION:Annual charitable fellowship tea benefiting youth mentoring and college scholarship endowments.
LOCATION:Grand Ballroom, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-epsilon': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MWPHGLDC//Constituent Lodges and Concordant Bodies//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:MWPHGLDC - Orgs
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:mwphgldc-lodges-meeting@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260914T193000
DTEND;TZID=America/New_York:20260914T213000
RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=24
SUMMARY:Constituent Lodges & Appendant Bodies Regular Assemblies
DESCRIPTION:Scheduled communications for constituent lodges under the jurisdiction of the Most Worshipful Prince Hall Grand Lodge of DC.
LOCATION:Lodge Rooms 1 & 2, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,

  'org-zeta': `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MWPHGLDC//Facility Reservations 1000 U St//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:MWPHGLDC - Rooms (1000 U St)
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:mwphgldc-room-ballroom@phfamoescef.com
DTSTAMP:20260901T000000Z
DTSTART;TZID=America/New_York:20260911T170000
DTEND;TZID=America/New_York:20260911T230000
RRULE:FREQ=WEEKLY;BYDAY=FR;COUNT=16
SUMMARY:Grand Ballroom Reserved - Fraternal & Community Receptions
DESCRIPTION:Scheduled room reservation for Grand Ballroom events, catering setups, and post-communication fellowship.
LOCATION:Grand Ballroom, 1000 U Street NW, Washington, DC 20001
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`,
};
