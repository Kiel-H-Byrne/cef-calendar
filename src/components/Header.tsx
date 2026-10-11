"use client";

import { Layers, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { SITE } from "@/config/site";

interface HeaderProps {
  totalEvents: number;
  totalOrgs: number;
  lastUpdated: string;
}

export function Header({
  totalEvents,
  totalOrgs,
  lastUpdated,
}: HeaderProps) {
  const formattedSyncTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="w-full sm:sticky sm:top-0 z-30 shadow-md">
      {/* Navy fill under the iOS status bar / notch when installed to the home screen (0px elsewhere) */}
      <div aria-hidden="true" className="h-[env(safe-area-inset-top)] bg-[#0B2545]" />

      {/* Main Fraternal Header with Official Brand Logos */}
      <nav
        aria-label="Primary Navigation"
        className="w-full bg-[#0B2545] border-b border-[#D4AF37] backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Logo Area: Official Organization Logos */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
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
                  <h1 className="text-base sm:text-xl leading-tight sm:leading-normal font-bold tracking-tight text-white font-heading">
                    {SITE.name}
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                    Live Sync
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs leading-snug sm:leading-normal text-slate-300 tracking-wide mt-0.5">
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

            {/* Right Controls: Event Count & Sync Status (hidden on phones to save vertical space) */}
            <div className="hidden sm:flex items-center gap-3 md:self-center text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#003366] text-white font-mono text-[11px] border border-[#D4AF37]/40 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{totalEvents} Events</span>
                {formattedSyncTime && (
                  <span className="text-slate-300">
                    • Updated {formattedSyncTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
