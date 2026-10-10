'use client';

import React, { useState } from 'react';
import {
  Check,
  Search,
  X,
  RotateCw,
  Rss,
  SlidersHorizontal,
  ChevronDown,
  Download,
  Globe,
  Smartphone,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { OrgCalendarConfig, UnifiedCalendarEvent } from '@/config/calendars';
import { OrgLogo } from './FraternalEmblems';

interface FilterToolbarProps {
  sources: OrgCalendarConfig[];
  events: UnifiedCalendarEvent[];
  selectedOrgIds: Set<string>;
  onToggleOrg: (orgId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenSubscribeModal: () => void;
  warnings: string[];
}

export function FilterToolbar({
  sources,
  events,
  selectedOrgIds,
  onToggleOrg,
  onSelectAll,
  onClearAll,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
  onOpenSubscribeModal,
  warnings,
}: FilterToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  // Count events per org
  const orgEventCounts = sources.reduce<Record<string, number>>((acc, src) => {
    acc[src.id] = events.filter((e) => e.orgId === src.id).length;
    return acc;
  }, {});

  const allSelected = selectedOrgIds.size === sources.length;
  const noneSelected = selectedOrgIds.size === 0;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const masterWebcal = `${origin}/api/calendar/master.ics`.replace(/^https?:\/\//i, 'webcal://');
  const masterHttp = `${origin}/api/calendar/master.ics`;

  const handleCopyLink = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section aria-label="Calendar Controls and Filters" className="space-y-3.5">
      {/* Warning Notification Banner if any feeds had issues */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Feed Notice: </span>
              {warnings.length} feed notice{warnings.length > 1 ? 's' : ''} detected. (Serving cached jurisdictional events).
              {showWarnings ? (
                <ul className="mt-1.5 list-disc list-inside space-y-0.5 opacity-95">
                  {warnings.map((w, i) => (
                    <li key={i} className="break-all font-mono text-[11px]">{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 hover:text-amber-950 dark:hover:text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            {showWarnings ? 'Hide details' : 'View details'}
          </button>
        </div>
      )}

      {/* Main Controls Card */}
      <div className="relative bg-white dark:bg-[#0B2545] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-[#003366] dark:border-t-[#D4AF37] transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, communications, meetings, or rooms..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#07192F] border border-slate-300 dark:border-slate-700 text-[#1A1D20] dark:text-[#F8F9FA] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              aria-label="Search events by title or location"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0B2545] dark:hover:text-slate-200 focus:outline-none"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Controls: Refresh, Quick Actions, Subscribe Dropdown */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            {/* Quick Select / Clear */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#07192F] p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={onSelectAll}
                disabled={allSelected}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  allSelected
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-[#003366] dark:text-[#D4AF37] hover:bg-white dark:hover:bg-[#0B2545] hover:text-[#0B2545] shadow-xs'
                }`}
                aria-label="Select all organizations"
              >
                Select All
              </button>
              <button
                onClick={onClearAll}
                disabled={noneSelected}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  noneSelected
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-[#003366] dark:text-[#D4AF37] hover:bg-white dark:hover:bg-[#0B2545] hover:text-[#0B2545] shadow-xs'
                }`}
                aria-label="Clear all organizations"
              >
                Clear
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#07192F] hover:bg-slate-50 dark:hover:bg-[#003366] text-[#003366] dark:text-[#D4AF37] transition-colors shadow-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              title="Refresh calendar feeds from servers"
              aria-label="Refresh calendar feeds"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            </button>

            {/* Subscribe Dropdown Trigger (Imperial Gold CTA Button) */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(212,175,55,0.3)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="Quick calendar subscription menu"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>Subscribe</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0B2545] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2.5 bg-[#0B2545] border-b border-[#D4AF37]">
                      <div className="text-xs font-bold text-white">
                        Sync Jurisdictional Calendar
                      </div>
                      <div className="text-[11px] text-[#D4AF37]">
                        Direct calendar sync
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <a
                        href={masterWebcal}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors"
                      >
                        <Smartphone className="w-4 h-4 text-[#003366] dark:text-[#D4AF37]" />
                        <div>
                          <div className="font-semibold text-[#0B2545] dark:text-white">Apple / Outlook</div>
                          <div className="text-[10px] text-slate-400">One-click calendar sync</div>
                        </div>
                      </a>

                      <a
                        href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(masterHttp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors"
                      >
                        <Globe className="w-4 h-4 text-[#D4AF37]" />
                        <div>
                          <div className="font-semibold text-[#0B2545] dark:text-white">Google Calendar</div>
                          <div className="text-[10px] text-slate-400">Add to web calendar</div>
                        </div>
                      </a>

                      <a
                        href={masterHttp}
                        download="master.ics"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-semibold text-[#0B2545] dark:text-white">Download Calendar File (.ics)</div>
                          <div className="text-[10px] text-slate-400">Offline calendar backup (master.ics)</div>
                        </div>
                      </a>

                      <button
                        onClick={() => handleCopyLink(masterHttp, 'quick-copy')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Copy className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-semibold text-[#0B2545] dark:text-white">Copy Calendar Link</div>
                            <div className="text-[10px] text-slate-400">Paste in Apple, Outlook, or Google</div>
                          </div>
                        </div>
                        {copiedKey === 'quick-copy' && (
                          <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                        )}
                      </button>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#07192F]">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenSubscribeModal();
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-[#003366] dark:text-[#D4AF37] hover:underline transition-colors"
                      >
                        More options & individual feeds →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organization Filter Badges with Official Logos and Distinct Colors */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 text-xs text-[#0B2545] dark:text-[#D4AF37] mr-1 font-bold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Organizations &amp; Feeds:</span>
        </div>

        {sources.map((src) => {
          const isSelected = selectedOrgIds.has(src.id);
          const count = orgEventCounts[src.id] || 0;

          return (
            <button
              key={src.id}
              onClick={() => onToggleOrg(src.id)}
              className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs border focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                isSelected
                  ? 'border-transparent shadow-sm'
                  : 'bg-white dark:bg-[#0B2545] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
              style={{
                backgroundColor: isSelected ? src.color.primary : undefined,
                color: isSelected ? src.color.text : undefined,
                borderColor: isSelected ? src.color.secondary : undefined,
              }}
              aria-pressed={isSelected}
              aria-label={`Filter by ${src.name}`}
            >
              {/* Checkmark or Colored Pip */}
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSelected
                    ? 'bg-black/25 text-white'
                    : 'text-transparent'
                }`}
                style={{
                  backgroundColor: !isSelected ? src.color.primary : undefined,
                }}
              >
                {isSelected ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : null}
              </span>

              {/* Official Brand Logo */}
              <OrgLogo orgId={src.id} size={20} className="w-5 h-5 flex-shrink-0" />

              <span className="font-semibold">{src.name}</span>

              {/* Event count badge */}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isSelected
                    ? 'bg-black/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
