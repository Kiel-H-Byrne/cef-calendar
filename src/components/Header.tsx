'use client';

import React from 'react';
import { Rss, Layers, ShieldCheck } from 'lucide-react';
import {
  MasonicEmblem,
  EasternStarEmblem,
  TaxExemptBadge,
  LocationBadge,
} from './FraternalEmblems';

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
  const formattedSyncTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="w-full sticky top-0 z-30 shadow-md">
      {/* Top Announcement & Landmark Bar */}
      <aside aria-label="Announcement and Location Banner" className="w-full bg-[#061527] border-b border-[#0B2545] text-zinc-300 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 text-[11px]">
          {/* Heritage & Jurisdiction Note */}
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="font-semibold text-[#D4AF37] tracking-wider uppercase">
              Prince Hall Freemasonry
            </span>
            <span className="hidden sm:inline text-zinc-500">•</span>
            <span className="hidden sm:inline">
              Est. 1825 in the District of Columbia • Historic Black Institutional Stewardship
            </span>
          </div>

          {/* Badges: 501(c)(3) & Location */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <TaxExemptBadge />
            <LocationBadge />
          </div>
        </div>
      </aside>

      {/* Main Fraternal Header */}
      <nav aria-label="Primary Navigation" className="w-full bg-[#0B2545] border-b border-[#D4AF37] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Logo Area: Fraternal Emblems & Branding */}
            <div className="flex items-center gap-3.5">
              {/* Dual Fraternal Emblems: Masonic & Eastern Star */}
              <div
                className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-[#003366] border border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0"
                title="MWPHGLDC (Masonic) & GTGC (Eastern Star) United in Leadership"
              >
                <MasonicEmblem className="w-7 h-7" color="#D4AF37" strokeWidth={2} />
                <div className="w-[1px] h-6 bg-[#D4AF37]/40" />
                <EasternStarEmblem className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                    Prince Hall Masonic Temple &amp; Jurisdictional Calendar
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-zinc-300 tracking-wide mt-0.5">
                  <span className="text-[#D4AF37] font-semibold">MWPHGLDC</span> •{' '}
                  <span className="text-zinc-200">Georgiana Thomas Grand Chapter O.E.S.</span> •{' '}
                  <span className="text-zinc-300">PHFAMOESCEF THC</span> ({totalOrgs} Feeds)
                </p>
              </div>
            </div>

            {/* Right Controls: Event Count & Gold Action Button */}
            <div className="flex items-center gap-3 self-end md:self-center text-xs">
              {/* Status Sync Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#003366]/80 text-zinc-200 font-mono text-[11px] border border-[#D4AF37]/30">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{totalEvents} Events</span>
                {formattedSyncTime && (
                  <span className="text-zinc-400">• Updated {formattedSyncTime}</span>
                )}
              </div>

              {/* Primary Action Button (Gold CTA) */}
              <button
                onClick={onOpenSubscribe}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all duration-150 transform hover:scale-[1.02] active:scale-100 shadow-[0_0_15px_rgba(212,175,55,0.3)] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none motion-reduce:transition-none motion-reduce:transform-none"
                aria-label="Subscribe to calendar feeds"
              >
                <Rss className="w-3.5 h-3.5 text-[#0B2545]" />
                <span>Subscribe to Feeds</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
