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
    <div className="space-y-3">
      {/* Warning Notification Banner if any feeds had issues */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">Feed Notice: </span>
              {warnings.length} feed warning{warnings.length > 1 ? 's' : ''} detected. (Fallback data is serving active events).
              {showWarnings ? (
                <ul className="mt-1.5 list-disc list-inside space-y-0.5 opacity-90">
                  {warnings.map((w, i) => (
                    <li key={i} className="break-all font-mono text-[11px]">{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="text-[11px] font-semibold underline underline-offset-2 flex-shrink-0 hover:text-amber-900 dark:hover:text-amber-100"
          >
            {showWarnings ? 'Hide details' : 'View details'}
          </button>
        </div>
      )}

      {/* Main Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search events by title, location, or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Refresh, Quick Actions, Subscribe Dropdown */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {/* Quick Select / Clear */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              onClick={onSelectAll}
              disabled={allSelected}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                allSelected
                  ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 shadow-xs'
              }`}
            >
              Select All
            </button>
            <button
              onClick={onClearAll}
              disabled={noneSelected}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                noneSelected
                  ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 shadow-xs'
              }`}
            >
              Clear
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh feeds from server"
            aria-label="Refresh calendar feeds"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Subscribe Dropdown / Modal Trigger */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
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
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Sync Community Calendar
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Subscribe using standard webcal:// feed
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <a
                      href={masterWebcal}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-semibold">Apple / Outlook</div>
                        <div className="text-[10px] text-zinc-400">One-click calendar app sync</div>
                      </div>
                    </a>

                    <a
                      href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(masterHttp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="font-semibold">Google Calendar</div>
                        <div className="text-[10px] text-zinc-400">Add to web calendar</div>
                      </div>
                    </a>

                    <a
                      href={masterHttp}
                      download="combined-community-calendar.ics"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-4 h-4 text-zinc-400" />
                      <div>
                        <div className="font-semibold">Download Master .ics</div>
                        <div className="text-[10px] text-zinc-400">Standard RFC 5545 export</div>
                      </div>
                    </a>

                    <button
                      onClick={() => handleCopyLink(masterWebcal, 'quick-copy')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Copy className="w-4 h-4 text-zinc-400" />
                        <div>
                          <div className="font-semibold">Copy webcal URL</div>
                          <div className="text-[10px] text-zinc-400">Paste in any calendar app</div>
                        </div>
                      </div>
                      {copiedKey === 'quick-copy' && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </button>
                  </div>

                  <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSubscribeModal();
                      }}
                      className="w-full py-1.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
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

      {/* Organization Pill Badges / Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mr-1 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Organizations:</span>
        </div>

        {sources.map((src) => {
          const isSelected = selectedOrgIds.has(src.id);
          const count = orgEventCounts[src.id] || 0;

          return (
            <button
              key={src.id}
              onClick={() => onToggleOrg(src.id)}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs border ${
                isSelected
                  ? 'border-transparent shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isSelected ? src.color.primary : undefined,
                color: isSelected ? src.color.text : undefined,
                borderColor: isSelected ? src.color.secondary : undefined,
              }}
              aria-pressed={isSelected}
            >
              {/* Checkbox Icon */}
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-600 text-transparent'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>

              <span>{src.name}</span>

              {/* Event count badge */}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
