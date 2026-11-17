'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Monitor,
  Tv,
  X,
} from 'lucide-react';
import { FiveColorOesStrip } from './FraternalEmblems';

interface SignageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignageModal({ isOpen, onClose }: SignageModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const signageLinks = [
    {
      key: 'day',
      title: 'Full-Screen Day View (Recommended for Lobbies)',
      url: `${origin}/?view=day`,
      description:
        'Displays today’s detailed hourly schedule with room locations, official organization badges, and live clock. Automatically rolls over to the next day at midnight.',
      badge: 'Lobby & Reception',
    },
    {
      key: 'week',
      title: 'Full-Screen Week View',
      url: `${origin}/?view=week`,
      description:
        'Displays a 7-day chronological matrix across all fraternal halls and constituent events.',
      badge: 'Hallways & Foyers',
    },
    {
      key: 'month',
      title: 'Full-Screen Month View',
      url: `${origin}/?view=month`,
      description:
        'Comprehensive monthly grid with all events displayed and none truncated with (+N more).',
      badge: 'Executive & Admin',
    },
    {
      key: 'rooms',
      title: 'Rooms & Facilities Day Schedule (1000 U St NW)',
      url: `${origin}/?view=day&org=rooms`,
      description:
        'Filtered specifically to facility bookings, room reservations, and temple meetings.',
      badge: 'Room Signs & Screens',
    },
    {
      key: 'dark-day',
      title: 'Dark Theme Day View',
      url: `${origin}/?view=day&theme=dark`,
      description:
        'Forces dark institutional navy theme, optimized for low-glare digital screens and TV displays.',
      badge: 'Low-Glare Display',
    },
  ];

  const handleCopy = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error('Failed to copy signage URL:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signage-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0B2545] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <FiveColorOesStrip className="h-1.5 w-full flex-shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#003366] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs flex-shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="signage-modal-title"
                className="text-lg sm:text-xl font-bold text-[#0B2545] dark:text-[#F8F9FA] tracking-tight font-heading flex items-center gap-2"
              >
                Digital Signage &amp; Kiosk Views
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-sans font-semibold border border-[#D4AF37]/30">
                  Xibo CMS Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                Full-screen, border-to-border calendar layouts optimized for unattended displays and TV kiosks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick Notice */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Tv className="w-4 h-4 text-[#003366] dark:text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-[#0B2545] dark:text-white">How it works with Xibo: </span>
              In your Xibo CMS Layout designer, add a <strong>Webpage Widget</strong> to your layout or region and paste any of the URLs below. The layout prioritizes 100% of the screen for the calendar, displays the organization legend with official brand logos, and eliminates all website branding, headers, footers, and links.
            </div>
          </div>

          {/* Signage URLs List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Ready-to-Use URLs for Signage CMS
            </div>

            {signageLinks.map((item) => (
              <div
                key={item.key}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#07192F] hover:border-[#D4AF37]/50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-[#0B2545] dark:text-white">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#003366] text-white dark:bg-[#D4AF37]/20 dark:text-[#D4AF37]">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2545] text-slate-700 dark:text-slate-200 hover:text-[#0B2545] dark:hover:text-white transition-colors"
                      title="Open full-screen preview in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopy(item.url, item.key)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#003366] hover:bg-[#0B2545] dark:bg-[#D4AF37] dark:hover:bg-[#B8952E] text-white dark:text-[#0B2545] transition-colors shadow-xs"
                      title="Copy URL to clipboard"
                    >
                      {copiedKey === item.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="font-mono text-[11px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0B2545] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate select-all">
                  {item.url}
                </div>
              </div>
            ))}
          </div>

          {/* URL Parameter Reference Guide */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-black/20 text-xs space-y-2">
            <div className="font-bold text-[#0B2545] dark:text-[#D4AF37] uppercase tracking-wide text-[11px]">
              URL Customization Parameters
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">?view=</strong> day | week | month | schedule
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">?org=</strong> thc | mwphgldc | gtgc | phfamoescef | rooms
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">?theme=</strong> dark | light
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">?refresh=</strong> 5 <span className="font-sans">(minutes between auto-refresh)</span>
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">?date=</strong> 2026-11-20 <span className="font-sans">(target specific date)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#07192F] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            All events are rendered with zero truncation (+N more is disabled in signage mode).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

