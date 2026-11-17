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
  isSignage?: boolean;
  isPrinting?: boolean;
  initialViewType?: string;
  initialDate?: string;
  onViewTypeChange?: (viewType: string) => void;
  onTitleChange?: (title: string) => void;
  calendarRefProp?: React.RefObject<FullCalendar | null>;
}

// Visible hours for the Week and Day time grids (6:00 AM - 11:00 PM)
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
  isSignage = false,
  isPrinting = false,
  initialViewType,
  initialDate,
  onViewTypeChange,
  onTitleChange,
  calendarRefProp,
}: CalendarViewProps) {
  const localCalendarRef = useRef<FullCalendar | null>(null);
  const calendarRef = calendarRefProp || localCalendarRef;

  const wasMobileRef = useRef<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentViewType, setCurrentViewType] = useState(
    initialViewType || (isMobile ? 'listMonth' : 'dayGridMonth')
  );

  // If initialViewType prop changes, update FullCalendar's active view
  useEffect(() => {
    if (initialViewType && calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type !== initialViewType) {
        api.changeView(initialViewType);
      }
    }
  }, [initialViewType, calendarRef]);

  // If initialDate prop is provided, navigate to that date
  useEffect(() => {
    if (initialDate && calendarRef.current) {
      calendarRef.current.getApi().gotoDate(initialDate);
    }
  }, [initialDate, calendarRef]);

  // Detect mobile screen width (< 768px).
  // If an explicit view was passed (e.g. from URL ?view=month or ?view=week), do not override it.
  useEffect(() => {
    if (initialViewType) return;

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
      wasMobileRef.current = null;
    };
  }, [initialViewType, calendarRef]);

  // Midnight Day Rollover Check for 24/7 Digital Signage and Home Screen Apps:
  // Detects when the calendar day rolls over and automatically advances the calendar to today.
  useEffect(() => {
    let lastSeenDay = new Date().toDateString();

    const checkMidnightRollover = () => {
      const today = new Date().toDateString();
      if (today !== lastSeenDay) {
        lastSeenDay = today;
        if (calendarRef.current) {
          calendarRef.current.getApi().today();
        }
      }
    };

    // Check on visibility change (device resumes from sleep)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkMidnightRollover();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    // Also check every 60 seconds for unattended digital signage displays running 24/7
    const timer = setInterval(checkMidnightRollover, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(timer);
    };
  }, [calendarRef]);

  // Day view opens scrolled to one hour before now so the current-time bar is visible
  useEffect(() => {
    if (currentViewType === 'timeGridDay' && calendarRef.current) {
      requestAnimationFrame(() =>
        calendarRef.current?.getApi().scrollToTime(getDayScrollTime())
      );
    }
  }, [currentViewType, calendarRef]);

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
    borderColor: ev.borderColor || ev.backgroundColor,
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

  // Determine initial view: prefer explicit initialViewType, then isMobile fallback
  const startView =
    initialViewType ||
    (isSignage ? 'dayGridMonth' : isMobile ? 'listMonth' : 'dayGridMonth');

  return (
    <div
      className={
        isSignage
          ? 'w-full h-full flex-1 bg-white dark:bg-[#07192F] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-1 sm:p-2 overflow-hidden flex flex-col'
          : 'w-full bg-white dark:bg-[#0B2545] rounded-xl shadow-card border border-slate-200 dark:border-slate-800 border-t-4 border-t-[#003366] dark:border-t-[#D4AF37] p-3 sm:p-5 transition-all overflow-hidden'
      }
    >
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={startView}
        initialDate={initialDate}
        // In signage mode, the SignageHeader controls title, legend, nav, and view switching
        headerToolbar={
          isSignage
            ? false
            : {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
              }
        }
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
        navLinks={!isSignage}
        editable={false}
        selectable={false}
        // Critical requirement: all events shown, none truncated with (+N more) in signage & print modes
        dayMaxEvents={isSignage || isPrinting ? false : 3}
        moreLinkClick={isSignage || isPrinting ? undefined : 'popover'}
        nowIndicator={true}
        expandRows={isSignage}
        height={isSignage ? '100%' : currentViewType === 'timeGridDay' ? '80vh' : 'auto'}
        datesSet={(arg) => {
          setCurrentViewType(arg.view.type);
          if (onViewTypeChange) onViewTypeChange(arg.view.type);
          if (onTitleChange) onTitleChange(arg.view.title);
        }}
        aspectRatio={isSignage ? undefined : isMobile ? 0.9 : 1.75}
        views={{
          dayGridMonth: {
            dayMaxEvents: isSignage || isPrinting ? false : 3,
          },
          timeGridWeek: {
            ...TIME_GRID_HOURS,
            dayMaxEvents: false,
          },
          timeGridDay: {
            ...TIME_GRID_HOURS,
            scrollTime: getDayScrollTime(),
            dayMaxEvents: false,
          },
          listMonth: {
            buttonText: 'Schedule',
          },
          listDay: {
            buttonText: 'Day Schedule',
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
          const viewType = arg.view.type;

          // 1. List / Agenda Views (listMonth, listDay)
          if (viewType.startsWith('list')) {
            return (
              <div className="flex items-center gap-2.5 py-0.5 overflow-hidden w-full">
                {raw && (
                  <OrgLogo
                    orgId={raw.orgId}
                    size={isSignage ? 20 : 18}
                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex-shrink-0"
                  />
                )}
                <span
                  className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold tracking-wider text-white uppercase flex-shrink-0"
                  style={{ backgroundColor: bgColor }}
                >
                  {raw?.orgName.split(' ')[0] || 'EVENT'}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-[#0B2545] dark:text-[#F8F9FA] truncate">
                  {arg.event.title}
                </span>
                {raw?.location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline truncate ml-auto">
                    📍 {raw.location}
                  </span>
                )}
              </div>
            );
          }

          // 2. TimeGrid Views (Day View & Week View)
          // In Day/Week time grid, display rich cards with Logo, Time, Title, and Room/Location
          if (viewType.startsWith('timeGrid')) {
            return (
              <div
                className="w-full h-full p-1 sm:p-1.5 rounded-md overflow-hidden border flex flex-col justify-start leading-snug cursor-pointer shadow-xs hover:brightness-105 transition-all"
                style={{
                  backgroundColor: bgColor,
                  color: txtColor,
                  borderColor: bdrColor,
                }}
                title={`${arg.event.title} (${raw?.orgName || ''})`}
              >
                <div className="flex items-center justify-between gap-1 flex-shrink-0 mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    {raw && (
                      <OrgLogo orgId={raw.orgId} size={15} className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">
                      {raw?.orgName.split(' ')[0] || 'EVENT'}
                    </span>
                  </div>
                  {!arg.event.allDay && (
                    <span className="text-[10px] font-mono font-semibold opacity-95 bg-black/25 px-1 py-0.2 rounded flex-shrink-0">
                      {arg.timeText}
                    </span>
                  )}
                </div>

                <div className="font-bold text-[11px] sm:text-xs leading-tight line-clamp-2">
                  {arg.event.title}
                </div>

                {raw?.location && (
                  <div className="text-[10px] opacity-90 truncate mt-auto pt-0.5 flex items-center gap-0.5">
                    <span className="opacity-75">📍</span>
                    <span className="truncate">{raw.location}</span>
                  </div>
                )}
              </div>
            );
          }

          // 3. Month Grid (dayGridMonth)
          return (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold w-full overflow-hidden cursor-pointer shadow-xs hover:brightness-110 transition-all border ${
                isSignage ? 'my-0.5 py-1 text-[11px] sm:text-xs' : ''
              }`}
              style={{
                backgroundColor: bgColor,
                color: txtColor,
                borderColor: bdrColor,
              }}
              title={`${arg.event.title} (${raw?.orgName || ''})`}
            >
              {raw && (
                <OrgLogo
                  orgId={raw.orgId}
                  size={isSignage ? 16 : 14}
                  className="w-3.5 h-3.5 flex-shrink-0"
                />
              )}
              {!arg.event.allDay && (
                <span className="opacity-90 font-mono text-[10px] flex-shrink-0">
                  {arg.timeText}
                </span>
              )}
              <span className="truncate font-medium">{arg.event.title}</span>
            </div>
          );
        }}
      />
    </div>
  );
}
