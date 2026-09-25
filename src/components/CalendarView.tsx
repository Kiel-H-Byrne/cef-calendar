'use client';

import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { UnifiedCalendarEvent, OrgCalendarConfig } from '@/config/calendars';

interface CalendarViewProps {
  events: UnifiedCalendarEvent[];
  sources: OrgCalendarConfig[];
  selectedOrgIds: Set<string>;
  searchQuery: string;
  onEventClick: (event: UnifiedCalendarEvent) => void;
}

export function CalendarView({
  events,
  sources,
  selectedOrgIds,
  searchQuery,
  onEventClick,
}: CalendarViewProps) {
  const calendarRef = useRef<any>(null);
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
    borderColor: ev.borderColor,
    textColor: ev.textColor,
    extendedProps: {
      rawEvent: ev,
    },
  }));

  const handleEventClick = (arg: any) => {
    arg.jsEvent.preventDefault();
    const rawEvent = arg.event.extendedProps?.rawEvent as UnifiedCalendarEvent | undefined;
    if (rawEvent) {
      onEventClick(rawEvent);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-3 sm:p-5 transition-colors overflow-hidden">
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
          list: 'List',
        }}
        events={fullCalendarEvents}
        eventClick={handleEventClick}
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
          const bgColor = raw?.backgroundColor || arg.event.backgroundColor || '#3b82f6';
          const txtColor = raw?.textColor || arg.event.textColor || '#ffffff';
          const bdrColor = raw?.borderColor || arg.event.borderColor || bgColor;

          if (arg.view.type.startsWith('list')) {
            return (
              <div className="flex items-center gap-2 py-0.5 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: bgColor }}
                />
                <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {arg.event.title}
                </span>
                {raw?.location && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline truncate">
                    • {raw.location}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium w-full overflow-hidden cursor-pointer shadow-xs hover:brightness-110 transition-all border"
              style={{
                backgroundColor: bgColor,
                color: txtColor,
                borderColor: bdrColor,
              }}
            >
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
