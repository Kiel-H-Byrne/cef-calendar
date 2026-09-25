'use client';

import React from 'react';
import { CalendarDays, Rss, Layers, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  totalEvents: number;
  totalOrgs: number;
  lastUpdated: string;
  onOpenSubscribe: () => void;
}

export function Header({
  totalEvents,
  totalOrgs,
  lastUpdated,
  onOpenSubscribe,
}: HeaderProps) {
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const formattedSyncTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Community Calendar Overlay Hub
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Unified public schedule across {totalOrgs} non-profit partner organizations
              </p>
            </div>
          </div>

          {/* Right Info & Subscribe Button */}
          <div className="flex items-center gap-3 self-end sm:self-center text-xs">
            {/* Sync Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200/60 dark:border-zinc-700/60">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>{totalEvents} Events</span>
              {formattedSyncTime && (
                <span className="text-zinc-400">• Updated {formattedSyncTime}</span>
              )}
            </div>

            <button
              onClick={onOpenSubscribe}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-colors shadow-xs"
            >
              <Rss className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
              <span>Subscribe to Feeds</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
