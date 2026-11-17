'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, RotateCw, X } from 'lucide-react';
import { OrgCalendarConfig } from '@/config/calendars';
import { FiveColorOesStrip, OrgLogo } from './FraternalEmblems';

interface SignageHeaderProps {
  sources: OrgCalendarConfig[];
  selectedOrgIds: Set<string>;
  currentTitle: string;
  activeView: string;
  onViewChange: (view: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  lastUpdated: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  totalEvents?: number;
}

export function SignageHeader({
  sources,
  selectedOrgIds,
  currentTitle,
  activeView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  lastUpdated,
  onRefresh,
  isLoading = false,
  totalEvents,
}: SignageHeaderProps) {
  // Live ticking clock for digital signage displays
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter sources to those currently displayed
  const activeSources = sources.filter((s) =>
    selectedOrgIds.size === 0 ? true : selectedOrgIds.has(s.id)
  );

  // Normalize activeView to tab key: 'day', 'week', 'month', 'list'
  const isDay = activeView.includes('Day');
  const isWeek = activeView.includes('Week');
  const isMonth = activeView === 'dayGridMonth' || activeView === 'month';
  const isList = activeView.startsWith('list');

  return (
    <header className="w-full bg-[#0B2545] border-b-2 border-[#D4AF37] text-white flex-shrink-0 shadow-md select-none">
      {/* Five-color accent strip along very top */}
      <FiveColorOesStrip className="h-1 w-full" />

      <div className="w-full px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Organization Legend & Iconography */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-xs font-bold font-heading uppercase tracking-wider flex-shrink-0">
            <span>Legend:</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {activeSources.map((src) => (
              <div
                key={src.id}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/10 dark:bg-black/30 border border-white/15 shadow-xs transition-all"
                title={`${src.name}`}
              >
                {/* Colored Pip */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/40"
                  style={{ backgroundColor: src.color.primary }}
                />
                {/* Official Brand Logo */}
                <OrgLogo orgId={src.id} size={16} className="w-4 h-4 flex-shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[180px] text-slate-100">
                  {src.shortName?.toUpperCase() || src.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Navigation Controls & Active Date Title */}
        <div className="flex items-center gap-2 flex-shrink-0 mx-auto lg:mx-0">
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/15">
            <button
              onClick={onPrev}
              className="p-1 rounded hover:bg-white/20 text-white transition-colors"
              aria-label="Previous period"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-2.5 py-0.5 rounded text-xs font-semibold hover:bg-white/20 text-[#D4AF37] transition-colors"
              title="Return to today"
            >
              Today
            </button>
            <button
              onClick={onNext}
              className="p-1 rounded hover:bg-white/20 text-white transition-colors"
              aria-label="Next period"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white font-heading px-1">
            {currentTitle || currentDateFormatted}
          </h1>

          {totalEvents !== undefined && (
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-[#003366] border border-[#D4AF37]/40 text-[11px] font-mono font-semibold text-[#D4AF37]">
              {totalEvents} {totalEvents === 1 ? 'Event' : 'Events'}
            </span>
          )}
        </div>

        {/* Right: Live Clock, View Switcher & Live Badge */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          {/* View Switcher Tabs (Day, Week, Month, Schedule) */}
          <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/20 text-xs">
            <button
              onClick={() => onViewChange('timeGridDay')}
              className={`px-2.5 sm:px-3 py-1 rounded font-semibold transition-all ${
                isDay
                  ? 'bg-[#D4AF37] text-[#0B2545] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => onViewChange('timeGridWeek')}
              className={`px-2.5 sm:px-3 py-1 rounded font-semibold transition-all ${
                isWeek
                  ? 'bg-[#D4AF37] text-[#0B2545] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewChange('dayGridMonth')}
              className={`px-2.5 sm:px-3 py-1 rounded font-semibold transition-all ${
                isMonth
                  ? 'bg-[#D4AF37] text-[#0B2545] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewChange('listMonth')}
              className={`px-2.5 sm:px-3 py-1 rounded font-semibold transition-all ${
                isList
                  ? 'bg-[#D4AF37] text-[#0B2545] font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Schedule
            </button>
          </div>

          {/* Live Digital Clock */}
          {currentTime && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-[#D4AF37]/30 text-white font-mono text-xs font-semibold shadow-inner">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="tracking-wide">{currentTime}</span>
            </div>
          )}

          {/* Live Sync Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold"
            title={lastUpdated ? `Live sync active (Updated ${new Date(lastUpdated).toLocaleTimeString()})` : 'Live sync active'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">LIVE</span>
          </div>

          {/* Manual Refresh Button if needed */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh calendar data"
              aria-label="Refresh calendar data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            </button>
          )}

          {/* Exit Signage Mode Button (returns to normal site view) */}
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-900/60 border border-white/15 text-slate-300 hover:text-white transition-colors"
            title="Exit Full-Screen Signage Mode (Return to Standard Site)"
            aria-label="Exit Signage Mode"
          >
            <X className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

