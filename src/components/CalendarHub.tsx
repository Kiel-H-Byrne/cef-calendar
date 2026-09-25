'use client';

import React, { useState } from 'react';
import { OrgCalendarConfig, UnifiedCalendarEvent, EventsApiResponse } from '@/config/calendars';
import { Header } from './Header';
import { FilterToolbar } from './FilterToolbar';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
import { SubscribeModal } from './SubscribeModal';

interface CalendarHubProps {
  initialData: EventsApiResponse;
}

export function CalendarHub({ initialData }: CalendarHubProps) {
  const [events, setEvents] = useState<UnifiedCalendarEvent[]>(initialData.events);
  const [sources, setSources] = useState<OrgCalendarConfig[]>(initialData.sources);
  const [warnings, setWarnings] = useState<string[]>(initialData.warnings);
  const [lastUpdated, setLastUpdated] = useState<string>(initialData.lastUpdated);

  // By default, select all organizations
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(
    () => new Set(initialData.sources.map((s) => s.id))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<UnifiedCalendarEvent | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle single organization
  const handleToggleOrg = (orgId: string) => {
    setSelectedOrgIds((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) {
        next.delete(orgId);
      } else {
        next.add(orgId);
      }
      return next;
    });
  };

  // Select all
  const handleSelectAll = () => {
    setSelectedOrgIds(new Set(sources.map((s) => s.id)));
  };

  // Clear all
  const handleClearAll = () => {
    setSelectedOrgIds(new Set());
  };

  // Re-fetch calendar feeds from server with on-demand cache bypass and state reconciliation
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Bust any server ISR cache and fetch fresh external feeds
      const res = await fetch('/api/events?refresh=true', { cache: 'no-store' });
      if (res.ok) {
        const data: EventsApiResponse = await res.json();
        setEvents(data.events);
        setWarnings(data.warnings);
        setLastUpdated(data.lastUpdated);

        // Reconcile organizations dynamically
        const newSources = data.sources || [];
        setSources(newSources);

        setSelectedOrgIds((prev) => {
          const next = new Set<string>();
          const validIds = new Set(newSources.map((s) => s.id));
          // Preserve valid active selections
          for (const id of prev) {
            if (validIds.has(id)) next.add(id);
          }
          // Auto-select any newly added organizations
          for (const s of newSources) {
            if (!sources.some((existing) => existing.id === s.id)) {
              next.add(s.id);
            }
          }
          return next.size > 0 ? next : validIds;
        });

        // Trigger on-demand ISR revalidation in background
        fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to refresh events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        totalEvents={events.length}
        totalOrgs={sources.length}
        lastUpdated={lastUpdated}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Filters and Controls Toolbar */}
        <FilterToolbar
          sources={sources}
          events={events}
          selectedOrgIds={selectedOrgIds}
          onToggleOrg={handleToggleOrg}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          onOpenSubscribeModal={() => setIsSubscribeOpen(true)}
          warnings={warnings}
        />

        {/* Interactive FullCalendar View */}
        <CalendarView
          events={events}
          sources={sources}
          selectedOrgIds={selectedOrgIds}
          searchQuery={searchQuery}
          onEventClick={(ev) => setSelectedEvent(ev)}
        />
      </main>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Subscription Dialog Modal */}
      <SubscribeModal
        sources={sources}
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
    </div>
  );
}
