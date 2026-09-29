'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { OrgCalendarConfig, UnifiedCalendarEvent, EventsApiResponse } from '@/config/calendars';
import { Header } from './Header';
import { FilterToolbar } from './FilterToolbar';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
import { SubscribeModal } from './SubscribeModal';
import {
  TaxExemptBadge,
  LocationBadge,
  WebsiteLinkBadge,
  FiveColorOesStrip,
} from './FraternalEmblems';
import { Calendar, Globe } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#07192F] text-[#1A1D20] dark:text-[#F8F9FA] flex flex-col font-body transition-colors">
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

      {/* Dignified Fraternal Institutional Footer */}
      <footer className="w-full bg-[#0B2545] border-t-2 border-[#D4AF37] text-white mt-12">
        <FiveColorOesStrip className="h-1 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-700/80">
            {/* Column 1: Heritage & Dignity with Official Logos */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <Image
                  src="/mwphgldc_logo.png"
                  alt="MWPHGLDC"
                  width={34}
                  height={34}
                  className="w-8.5 h-8.5 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                <Image
                  src="/gtgc_logo.jpg"
                  alt="GTGC OES"
                  width={34}
                  height={34}
                  className="w-8.5 h-8.5 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                <Image
                  src="/cef_thc_logo.png"
                  alt="CEF THC"
                  width={34}
                  height={34}
                  className="w-8.5 h-8.5 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                <div className="ml-1">
                  <div className="font-bold text-sm tracking-tight text-white font-heading">
                    Prince Hall Masonic Temple
                  </div>
                  <div className="text-[11px] text-[#D4AF37] font-semibold">
                    1000 U Street NW • Washington, D.C.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reflecting the historic 1825 origins of Prince Hall Freemasonry in the District of Columbia and multi-generational institutional stewardship.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <TaxExemptBadge />
                <LocationBadge />
                <WebsiteLinkBadge />
              </div>
            </div>

            {/* Column 2: Fraternal Governance & Entities */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-heading">
                Fraternal Leadership &amp; Entities
              </h2>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Image
                    src="/mwphgldc_logo.png"
                    alt="MWPHGLDC"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <strong className="text-white">MWPHGLDC:</strong> Most Worshipful Prince Hall Grand Lodge of D.C. (Est. 1825)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Image
                    src="/gtgc_logo.jpg"
                    alt="GTGC"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <strong className="text-white">GTGC:</strong> Georgiana Thomas Grand Chapter, Order of the Eastern Star, PHA
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Image
                    src="/cef_logo.jpeg"
                    alt="PHFAMOESCEF"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <strong className="text-white">PHFAMOESCEF:</strong> Charitable &amp; Educational Foundation (501c3)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Image
                    src="/cef_thc_logo.png"
                    alt="CEF THC"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <strong className="text-white">CEF THC:</strong> Temple Holding Corporation (1000 U St NW)
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 3: Live Calendar Integration & Accessibility */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-heading">
                Calendar Integration &amp; Standards
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your personal device or computer calendar. Compatible with Apple Calendar, Microsoft Outlook, and Google Calendar. Engineered to meet <strong>WCAG 2.1 AA</strong> accessibility standards.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsSubscribeOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all transform hover:scale-[1.02] shadow-[0_0_12px_rgba(212,175,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0B2545]" />
                  <span>Subscribe to Calendar Feeds</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright, Website Link, & Heritage Line */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span>© {new Date().getFullYear()} Prince Hall Masonic Temple &amp; The MWPHGLDC / GTGC Jurisdiction.</span>
              <span>•</span>
              <a
                href="https://www.phfamoescef.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <Globe className="w-3 h-3 inline" />
                phfamoescef.com
              </a>
            </div>
            <div className="text-[11px] text-[#D4AF37]/90 font-medium">
              Heritage • Dignity • Fraternal Unity • Community Impact
            </div>
          </div>
        </div>
      </footer>

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
