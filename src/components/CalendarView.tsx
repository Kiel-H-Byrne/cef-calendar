'use client';

import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { UnifiedCalendarEvent, OrgCalendarConfig } from '@/config/calendars';
import { OrgLogo } from './FraternalEmblems';

interface CalendarViewProps {
  events: UnifiedCalendarEvent[];
  sources?: OrgCalendarConfig[];
  selectedOrgIds: Set<string>;
  searchQuery: string;
  onEventClick: (event: UnifiedCalendarEvent) => void;
}

// Visible hours for the Week and Day time grids
const SLOT_MIN_HOUR = 6;
const SLOT_MAX_HOUR = 23;
const TIME_GRID_HOURS = {
  slotMinTime: `${String(SLOT_MIN_HOUR).padStart(2, '0')}:00:00`,
  slotMaxTime: `${String(SLOT_MAX_HOUR).padStart(2, '0')}:00:00`,
};

// One hour before the current time, kept within the visible slot range
function getDayScrollTime(): string {
  const hour = Math.min(Math.max(new Date().getHours() - 1, SLOT_MIN_HOUR), SLOT_MAX_HOUR - 1);
  return `${String(hour).padStart(2, '0')}:00:00`;
}

export function CalendarView({
  events,
  selectedOrgIds,
  searchQuery,
  onEventClick,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const wasMobileRef = useRef<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewType, setViewType] = useState('dayGridMonth');

  // Detect mobile screen width (< 768px). Phones land on today's Day view; this only
  // happens on load or when crossing the breakpoint, so a view picked by hand isn't
  // undone by resize events (e.g. mobile browser toolbars collapsing while scrolling).
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && wasMobileRef.current !== true && calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi.view.type === 'dayGridMonth' || calendarApi.view.type === 'timeGridWeek') {
          calendarApi.changeView('timeGridDay');
        }
      }
      wasMobileRef.current = mobile;
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      // The calendar is re-created when effects re-run (Strict Mode), so re-apply the default view
      wasMobileRef.current = null;
    };
  }, []);

  // A home-screen app can stay suspended overnight and resume on yesterday's Day view;
  // jump back to today when the app comes to the foreground on a new calendar day.
  useEffect(() => {
    let lastSeenDay = new Date().toDateString();
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const today = new Date().toDateString();
      if (today !== lastSeenDay) {
        lastSeenDay = today;
        calendarRef.current?.getApi().today();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Day view gets a fixed height (its own scroller) and opens scrolled to one hour
  // before now so the current-time bar is on screen. FullCalendar's `height` is a
  // calendar-level option, so it follows the active view instead of living in `views`.
  useEffect(() => {
    if (viewType === 'timeGridDay') {
      requestAnimationFrame(() => calendarRef.current?.getApi().scrollToTime(getDayScrollTime()));
    }
  }, [viewType]);

  // Filter events based on selected organizations and search query
  const filteredEvents = events.filter((ev) => {
    // Org filter
    if (selectedOrgIds.size > 0 && !selectedOrgIds.has(ev.orgId)) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchDesc = ev.description?.toLowerCase().includes(query);
      const matchLoc = ev.location?.toLowerCase().includes(query);
      const matchOrg = ev.orgName.toLowerCase().includes(query);
      return matchTitle || matchDesc || matchLoc || matchOrg;
    }

    return true;
  });

  // Map to FullCalendar event format
  const fullCalendarEvents = filteredEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay,
    backgroundColor: ev.backgroundColor,
    borderColor: ev.backgroundColor,
    textColor: ev.textColor,
    extendedProps: {
      rawEvent: ev,
    },
  }));

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.preventDefault();
    const rawEvent = arg.event.extendedProps?.rawEvent as UnifiedCalendarEvent | undefined;
    if (rawEvent) {
      onEventClick(rawEvent);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B2545] rounded-xl shadow-card border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#003366] dark:border-t-[#D4AF37] p-3 sm:p-5 transition-all overflow-hidden">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={isMobile ? 'listMonth' : 'dayGridMonth'}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'Schedule',
        }}
        events={fullCalendarEvents}
        eventClick={handleEventClick}
        eventDidMount={(info) => {
          if (info.view.type.startsWith('list')) {
            const dot = info.el.querySelector('.fc-list-event-dot') as HTMLElement | null;
            const raw = info.event.extendedProps?.rawEvent as UnifiedCalendarEvent | undefined;
            const color = raw?.backgroundColor || info.event.backgroundColor;
            if (dot && color) {
              dot.style.borderColor = color;
            }
          }
        }}
        navLinks={true}
        editable={false}
        selectable={false}
        dayMaxEvents={3}
        moreLinkClick="popover"
        nowIndicator={true}
        height={viewType === 'timeGridDay' ? '80vh' : 'auto'}
        datesSet={(arg) => setViewType(arg.view.type)}
        aspectRatio={isMobile ? 0.9 : 1.75}
        views={{
          dayGridMonth: {
            dayMaxEvents: 3,
          },
          timeGridWeek: TIME_GRID_HOURS,
          timeGridDay: {
            ...TIME_GRID_HOURS,
            scrollTime: getDayScrollTime(),
          },
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventContent={(arg) => {
          const raw = arg.event.extendedProps?.rawEvent as UnifiedCalendarEvent | undefined;
          const bgColor = raw?.backgroundColor || arg.event.backgroundColor || '#003366';
          const txtColor = raw?.textColor || arg.event.textColor || '#ffffff';
          const bdrColor = raw?.borderColor || arg.event.borderColor || '#D4AF37';

          if (arg.view.type.startsWith('list')) {
            return (
              <div className="flex items-center gap-2.5 py-0.5 overflow-hidden">
                {raw && (
                  <OrgLogo orgId={raw.orgId} size={18} className="w-4.5 h-4.5 flex-shrink-0" />
                )}
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white uppercase flex-shrink-0"
                  style={{ backgroundColor: bgColor }}
                >
                  {raw?.orgName.split(' ')[0] || 'EVENT'}
                </span>
                <span className="font-semibold text-[#0B2545] dark:text-[#F8F9FA] truncate">
                  {arg.event.title}
                </span>
                {raw?.location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                    • {raw.location}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold w-full overflow-hidden cursor-pointer shadow-xs hover:brightness-110 transition-all border"
              style={{
                backgroundColor: bgColor,
                color: txtColor,
                borderColor: bdrColor,
              }}
              title={`${arg.event.title} (${raw?.orgName || ''})`}
            >
              {raw && (
                <OrgLogo orgId={raw.orgId} size={14} className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              {!arg.event.allDay && (
                <span className="opacity-90 font-mono text-[10px] flex-shrink-0">
                  {arg.timeText}
                </span>
              )}
              <span className="truncate">{arg.event.title}</span>
            </div>
          );
        }}
      />
    </div>
  );
}
