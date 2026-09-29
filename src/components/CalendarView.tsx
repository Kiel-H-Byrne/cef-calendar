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

export function CalendarView({
  events,
  selectedOrgIds,
  searchQuery,
  onEventClick,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen width (< 768px) and switch to list view automatically
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi && (calendarApi.view.type === 'dayGridMonth' || calendarApi.view.type === 'timeGridWeek')) {
          calendarApi.changeView('listMonth');
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          right: 'dayGridMonth,timeGridWeek,listMonth',
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          list: 'Schedule List',
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
        height="auto"
        aspectRatio={isMobile ? 0.9 : 1.75}
        views={{
          dayGridMonth: {
            dayMaxEvents: 3,
          },
          timeGridWeek: {
            slotMinTime: '06:00:00',
            slotMaxTime: '23:00:00',
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
