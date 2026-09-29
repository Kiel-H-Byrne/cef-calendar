"use client";

import { Layers, Rss, ShieldCheck } from "lucide-react";
import Image from "next/image";
import {
  LocationBadge,
  TaxExemptBadge,
  WebsiteLinkBadge,
} from "./FraternalEmblems";

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
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="w-full sticky top-0 z-30 shadow-md">
      {/* Top Announcement & Landmark Bar (Warm, High-Contrast Balance) */}
      <aside
        aria-label="Announcement and Location Banner"
        className="w-full bg-[#FAF8F5] dark:bg-[#061527] border-b border-[#E7E2D7] dark:border-[#0B2545] text-slate-800 dark:text-zinc-300 py-1.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 text-[11px]">
          {/* Heritage & Jurisdiction Note */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-300 font-medium">
            <span className="font-bold text-[#003366] dark:text-[#D4AF37] tracking-wider uppercase">
              Prince Hall Freemasonry
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">
              Est. 1825 in the District of Columbia • Historic Black
              Institutional Stewardship
            </span>
          </div>

          {/* Badges: 501(c)(3), Location, and Website phfamoescef.com */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <TaxExemptBadge />
            <LocationBadge />
            <WebsiteLinkBadge />
          </div>
        </div>
      </aside>

      {/* Main Fraternal Header with Official Brand Logos */}
      <nav
        aria-label="Primary Navigation"
        className="w-full bg-[#0B2545] border-b border-[#D4AF37] backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Logo Area: Official Organization Logos */}
            <div className="flex items-center gap-3.5">
              {/* Official Logos Side-by-Side: CEF, THC, MWPHGLDC, GTGC */}
              <div
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0"
                title="PHFAMOESCEF, CEF THC, MWPHGLDC, and GTGC Official Brand Emblems"
              >
                {/* 1. CEF Logo */}
                <Image
                  src="/cef_logo.jpeg"
                  alt="PHFAMOESCEF Official Logo"
                  width={36}
                  height={36}
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full object-contain bg-white p-0.5 border border-[#D4AF37]/40"
                />
                {/* 2. THC Logo */}
                <Image
                  src="/cef_thc_logo.png"
                  alt="CEF THC - Title Holding Company"
                  width={36}
                  height={36}
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full object-contain bg-white p-0.5 border border-[#D4AF37]/40"
                />
                {/* 3. MWPHGLDC Logo */}
                <Image
                  src="/mwphgldc_logo.png"
                  alt="Most Worshipful Prince Hall Grand Lodge of DC"
                  width={36}
                  height={36}
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full object-contain bg-white p-0.5 border border-[#D4AF37]/40"
                />
                {/* 4. GTGC Logo */}
                <Image
                  src="/gtgc_logo.jpg"
                  alt="Georgiana Thomas Grand Chapter O.E.S."
                  width={36}
                  height={36}
                  className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full object-contain bg-white p-0.5 border border-[#D4AF37]/40"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                    Prince Hall Masonic Temple &amp; Jurisdictional Calendar
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-300 tracking-wide mt-0.5">
                  <span className="text-[#D4AF37] font-semibold">MWPHGLDC</span>{" "}
                  •{" "}
                  <span className="text-white font-medium">
                    Georgiana Thomas Grand Chapter O.E.S.
                  </span>{" "}
                  • <span className="text-slate-300">PHFAMOESCEF THC</span> (
                  {totalOrgs} Feeds)
                </p>
              </div>
            </div>

            {/* Right Controls: Event Count & Gold Action Button */}
            <div className="flex items-center gap-3 self-end md:self-center text-xs">
              {/* Status Sync Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#003366] text-white font-mono text-[11px] border border-[#D4AF37]/40 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{totalEvents} Events</span>
                {formattedSyncTime && (
                  <span className="text-slate-300">
                    • Updated {formattedSyncTime}
                  </span>
                )}
              </div>

              {/* Primary Action Button (Gold CTA) */}
              <button
                onClick={onOpenSubscribe}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all duration-150 transform hover:scale-[1.02] active:scale-100 shadow-[0_0_15px_rgba(212,175,55,0.35)] focus:ring-2 focus:ring-[#D4AF37] focus:outline-none motion-reduce:transition-none motion-reduce:transform-none"
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
