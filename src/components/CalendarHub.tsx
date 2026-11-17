"use client";

import {
  EventsApiResponse,
  FeedStatus,
  OrgCalendarConfig,
  UnifiedCalendarEvent,
} from "@/config/calendars";
import FullCalendar from "@fullcalendar/react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { CalendarView } from "./CalendarView";
import { EventModal } from "./EventModal";
import { FilterToolbar } from "./FilterToolbar";
import { FiveColorOesStrip } from "./FraternalEmblems";
import { Header } from "./Header";
import { PrintHeader } from "./PrintHeader";
import { SignageHeader } from "./SignageHeader";
import { SignageModal } from "./SignageModal";
import { SubscribeModal } from "./SubscribeModal";

// Footer links to each organization's own site
const ORG_LINK_CLASS =
  "font-bold text-white underline decoration-[#D4AF37]/50 underline-offset-2 hover:text-[#D4AF37] hover:decoration-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm";

interface CalendarHubProps {
  initialData: EventsApiResponse;
}

/**
 * Resolves organization IDs from comma-separated tokens matching ID, shortName, or name.
 */
function resolveOrgIdsFromParam(
  param: string | null,
  sources: OrgCalendarConfig[],
): Set<string> | null {
  if (!param) return null;
  const tokens = param
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return null;

  const matched = new Set<string>();
  for (const token of tokens) {
    for (const src of sources) {
      if (
        src.id.toLowerCase() === token ||
        src.shortName.toLowerCase() === token ||
        src.name.toLowerCase().includes(token)
      ) {
        matched.add(src.id);
      }
    }
  }
  return matched.size > 0 ? matched : null;
}

/**
 * Maps view query parameter (e.g. 'day', 'week', 'month') to FullCalendar view identifier.
 */
function mapQueryParamToFullCalendarView(
  rawView: string | null,
): string | undefined {
  if (!rawView) return undefined;
  const v = rawView.toLowerCase().trim();
  switch (v) {
    case "day":
    case "today":
      return "timeGridDay";
    case "week":
      return "timeGridWeek";
    case "month":
      return "dayGridMonth";
    case "list":
    case "schedule":
    case "agenda":
      return "listMonth";
    case "daylist":
      return "listDay";
    case "timegridday":
      return "timeGridDay";
    case "timegridweek":
      return "timeGridWeek";
    case "daygridmonth":
      return "dayGridMonth";
    case "listmonth":
      return "listMonth";
    case "listday":
      return "listDay";
    default:
      return undefined;
  }
}

export function CalendarHub({ initialData }: CalendarHubProps) {
  const searchParams = useSearchParams();
  const calendarRef = useRef<FullCalendar | null>(null);

  const [events, setEvents] = useState<UnifiedCalendarEvent[]>(
    initialData.events,
  );
  const [sources, setSources] = useState<OrgCalendarConfig[]>(
    initialData.sources,
  );
  const [feedStatus, setFeedStatus] = useState<FeedStatus[]>(
    initialData.feedStatus,
  );
  const [lastUpdated, setLastUpdated] = useState<string>(
    initialData.lastUpdated,
  );

  // Parse URL search parameters
  const rawView = searchParams.get("view");
  const targetView = mapQueryParamToFullCalendarView(rawView);

  const signageParam =
    searchParams.get("signage") ||
    searchParams.get("kiosk") ||
    searchParams.get("fullscreen") ||
    searchParams.get("mode");

  const isExplicitSignage =
    signageParam === "true" || signageParam === "1" || signageParam === "yes";
  const isExplicitNormal =
    signageParam === "false" || signageParam === "0" || signageParam === "no";

  // When ?view=day, ?view=week, etc. or ?signage=true is accessed, full-page signage mode is active
  const isSignage =
    isExplicitSignage || (Boolean(rawView) && !isExplicitNormal);

  const orgParam =
    searchParams.get("org") ||
    searchParams.get("cal") ||
    searchParams.get("calendar") ||
    searchParams.get("calendars");
  const dateParam = searchParams.get("date") || undefined;
  const themeParam = searchParams.get("theme")?.toLowerCase();
  const refreshParam = searchParams.get("refresh");

  // Track explicit user selection if clicked in FilterToolbar; otherwise derive from orgParam or all sources
  const [userSelectedOrgIds, setUserSelectedOrgIds] = useState<Set<string> | null>(null);

  const selectedOrgIds = useMemo(() => {
    if (userSelectedOrgIds !== null) return userSelectedOrgIds;
    if (orgParam) {
      const matched = resolveOrgIdsFromParam(orgParam, sources);
      if (matched && matched.size > 0) return matched;
    }
    return new Set(sources.map((s) => s.id));
  }, [userSelectedOrgIds, orgParam, sources]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] =
    useState<UnifiedCalendarEvent | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSignageModalOpen, setIsSignageModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Detect print state to dynamically expand all events for full one-page printing
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Signage header synchronization state
  const [calendarTitle, setCalendarTitle] = useState("");
  const [currentViewType, setCurrentViewType] = useState(
    targetView || (isSignage ? "dayGridMonth" : "dayGridMonth"),
  );

  // Handle explicit ?theme=dark or ?theme=light query parameter
  useEffect(() => {
    if (themeParam === "dark") {
      document.documentElement.classList.add("dark");
    } else if (themeParam === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, [themeParam]);

  // Toggle single organization
  const handleToggleOrg = (orgId: string) => {
    setUserSelectedOrgIds((prev) => {
      const current = prev || selectedOrgIds;
      const next = new Set(current);
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
    setUserSelectedOrgIds(new Set(sources.map((s) => s.id)));
  };

  // Clear all
  const handleClearAll = () => {
    setUserSelectedOrgIds(new Set());
  };

  // Re-fetch calendar feeds from server with on-demand cache bypass and state reconciliation
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events?refresh=true", {
        cache: "no-store",
      });
      if (res.ok) {
        const data: EventsApiResponse = await res.json();
        setEvents(data.events);
        setFeedStatus(data.feedStatus);
        setLastUpdated(data.lastUpdated);
        setSources(data.sources || []);
        fetch("/api/revalidate", { method: "POST" }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to refresh events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 24/7 Digital Signage Auto-Refresh interval (defaults to 5 minutes)
  useEffect(() => {
    if (!isSignage) return;

    let intervalMs = 5 * 60 * 1000; // default 5 minutes
    if (refreshParam) {
      const num = parseInt(refreshParam, 10);
      if (!isNaN(num) && num > 0) {
        intervalMs = num < 60 ? num * 60 * 1000 : num * 1000;
      }
    }

    const timer = setInterval(() => {
      handleRefresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSignage, refreshParam, handleRefresh]);

  // Handle switching views from SignageHeader
  const handleSignageViewChange = (newView: string) => {
    setCurrentViewType(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
    // Update URL query parameter shallowly
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let viewParam = "day";
      if (newView === "dayGridMonth") viewParam = "month";
      else if (newView === "timeGridWeek") viewParam = "week";
      else if (newView.startsWith("list")) viewParam = "schedule";
      url.searchParams.set("view", viewParam);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // =========================================================================
  // 1. FULL-SCREEN DIGITAL SIGNAGE CMS VIEW (Priority 100% on the calendar)
  // =========================================================================
  if (isSignage) {
    return (
      <div className="signage-root flex flex-col bg-[#F8F9FA] dark:bg-[#07192F] text-[#1A1D20] dark:text-[#F8F9FA] font-body transition-colors">
        {/* Sleek Signage Header Bar: Legend with OrgLogos & colors, Live Clock, Nav, & View Switcher */}
        <SignageHeader
          sources={sources}
          selectedOrgIds={selectedOrgIds}
          currentTitle={calendarTitle}
          activeView={currentViewType}
          onViewChange={handleSignageViewChange}
          onPrev={() => calendarRef.current?.getApi().prev()}
          onNext={() => calendarRef.current?.getApi().next()}
          onToday={() => calendarRef.current?.getApi().today()}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          totalEvents={events.length}
        />

        {/* Priority 100% on the Calendar: No branding banners, footers, or external links */}
        <main className="flex-1 w-full h-full min-h-0 p-1 sm:p-2 overflow-hidden flex flex-col">
          <CalendarView
            events={events}
            sources={sources}
            selectedOrgIds={selectedOrgIds}
            searchQuery=""
            onEventClick={(ev) => setSelectedEvent(ev)}
            isSignage={true}
            initialViewType={targetView || "dayGridMonth"}
            initialDate={dateParam}
            calendarRefProp={calendarRef}
            onViewTypeChange={setCurrentViewType}
            onTitleChange={setCalendarTitle}
          />
        </main>

        {/* Event Detail Modal (Safe Kiosk Mode: auto-dismisses after 30s) */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            isSignage={true}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. STANDARD PUBLIC WEBSITE VIEW (Full Header, Filters, Calendar, Footer)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#07192F] text-[#1A1D20] dark:text-[#F8F9FA] flex flex-col font-body transition-colors">
      {/* Top Header */}
      <Header
        totalEvents={events.length}
        totalOrgs={sources.length}
        lastUpdated={lastUpdated}
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
          onOpenSignageModal={() => setIsSignageModalOpen(true)}
          onPrint={handlePrint}
          feedStatus={feedStatus}
        />

        {/* Dedicated Clean Header for PDF / Printer Exports */}
        <PrintHeader
          title={calendarTitle}
          sources={sources}
          selectedOrgIds={selectedOrgIds}
          searchQuery={searchQuery}
          totalEvents={events.length}
        />

        {/* Interactive FullCalendar View */}
        <CalendarView
          events={events}
          sources={sources}
          selectedOrgIds={selectedOrgIds}
          searchQuery={searchQuery}
          onEventClick={(ev) => setSelectedEvent(ev)}
          isSignage={false}
          isPrinting={isPrinting}
          initialViewType={targetView}
          initialDate={dateParam}
          calendarRefProp={calendarRef}
          onViewTypeChange={setCurrentViewType}
          onTitleChange={setCalendarTitle}
        />
      </main>

      {/* Dignified Fraternal Institutional Footer */}
      <footer className="w-full bg-[#0B2545] border-t-2 border-[#D4AF37] text-white mt-12 pb-[env(safe-area-inset-bottom)]">
        <FiveColorOesStrip className="h-1 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-700/80">
            {/* Column 1: Heritage & Dignity with All Four Official Logos */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* 1. CEF Logo */}
                <Image
                  src="/cef_logo.jpeg"
                  alt="PHFAMOESCEF Official Logo"
                  width={34}
                  height={34}
                  className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                {/* 2. THC Logo */}
                <Image
                  src="/cef_thc_logo.png"
                  alt="CEF THC Official Logo"
                  width={34}
                  height={34}
                  className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                {/* 3. MWPHGLDC Logo */}
                <Image
                  src="/mwphgldc_logo.png"
                  alt="MWPHGLDC Official Logo"
                  width={34}
                  height={34}
                  className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
                />
                {/* 4. GTGC Logo */}
                <Image
                  src="/gtgc_logo.jpg"
                  alt="GTGC OES Official Logo"
                  width={34}
                  height={34}
                  className="w-8 h-8 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]"
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
                Reflecting the historic 1825 origins of Prince Hall Freemasonry
                in the District of Columbia and multi-generational institutional
                stewardship.
              </p>
            </div>

            {/* Column 2: Fraternal Governance & Entities in Order (CEF, THC, MWPHGLDC, GTGC) */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-heading">
                Fraternal Leadership &amp; Entities
              </h2>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Image
                    src="/cef_logo.jpeg"
                    alt="PHFAMOESCEF"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <a
                      href="https://www.phfamoescef.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ORG_LINK_CLASS}
                    >
                      PHFAMOESCEF
                    </a>
                    : Charitable &amp; Educational Foundation (501c3)
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
                    <a
                      href="https://cef-thc.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ORG_LINK_CLASS}
                    >
                      CEF THC
                    </a>
                    : Title Holding Company (1000 U St NW)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Image
                    src="/mwphgldc_logo.png"
                    alt="MWPHGLDC"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <a
                      href="https://mwphgldc.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ORG_LINK_CLASS}
                    >
                      MWPHGLDC
                    </a>
                    : Most Worshipful Prince Hall Grand Lodge DC
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Image
                    src="/gtgc_logo.jpg"
                    alt="GTGC OES"
                    width={18}
                    height={18}
                    className="w-4.5 h-4.5 rounded-full bg-white object-contain"
                  />
                  <span>
                    <a
                      href="https://gtgcoes.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ORG_LINK_CLASS}
                    >
                      GTGC OES
                    </a>
                    : Georgiana Thomas Grand Chapter
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
                Connect your personal device or computer calendar. Compatible
                with Apple Calendar, Microsoft Outlook, and Google Calendar.
                Engineered to meet <strong>WCAG 2.1 AA</strong> accessibility
                standards.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setIsSubscribeOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all transform hover:scale-[1.02] shadow-[0_0_12px_rgba(212,175,55,0.25)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0B2545]" />
                  <span>Subscribe to Feeds</span>
                </button>
                <button
                  onClick={() => setIsSignageModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <span>Signage &amp; Kiosk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright, Website Link, & Heritage Line */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Image
                src="/icons/icon-192.png"
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 rounded-md"
              />
              <span className="font-semibold text-slate-300">{SITE.name}</span>
            </div>
            <div className="text-[11px] text-[#D4AF37]/90 font-medium">
              Heritage • Dignity • Fraternal Unity • Community Impact
            </div>
          </div>

          {/* Studio attribution */}
          <p className="pt-4 text-center text-[11px] text-slate-400">
            Designed &amp; built by{" "}
            <a
              href={SITE.builder.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-300 hover:text-[#D4AF37] hover:underline"
            >
              {SITE.builder.name}
            </a>
          </p>
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
        unavailableOrgIds={
          new Set(
            feedStatus
              .filter((feed) => feed.state === "unavailable")
              .map((feed) => feed.orgId),
          )
        }
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />

      {/* Digital Signage / Xibo CMS Modal */}
      <SignageModal
        isOpen={isSignageModalOpen}
        onClose={() => setIsSignageModalOpen(false)}
      />
    </div>
  );
}
