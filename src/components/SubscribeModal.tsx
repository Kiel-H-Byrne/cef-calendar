'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Check,
  Copy,
  Download,
  X,
  Smartphone,
  Globe,
  Radio,
} from 'lucide-react';
import { OrgCalendarConfig } from '@/config/calendars';
import {
  TaxExemptBadge,
  LocationBadge,
  WebsiteLinkBadge,
  OrgLogo,
} from './FraternalEmblems';

interface SubscribeModalProps {
  sources: OrgCalendarConfig[];
  isOpen: boolean;
  onClose: () => void;
}

export function SubscribeModal({ sources, isOpen, onClose }: SubscribeModalProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hostWithProto = origin || 'https://www.phfamoescef.com';
  const masterHttpUrl = `${hostWithProto}/api/calendar/master.ics`;
  const masterWebcalUrl = masterHttpUrl.replace(/^https?:\/\//i, 'webcal://');
  const googleSubscribeUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(masterHttpUrl)}`;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#0B2545] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Official Brand Logos (1: CEF, 2: THC, 3: MWPHGLDC, 4: GTGC) */}
        <div className="p-5 sm:p-6 bg-[#0B2545] border-b border-[#D4AF37] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <Image
                src="/cef_logo.jpeg"
                alt="PHFAMOESCEF"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]/40"
              />
              <Image
                src="/cef_thc_logo.png"
                alt="CEF THC"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]/40"
              />
              <Image
                src="/mwphgldc_logo.png"
                alt="MWPHGLDC"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]/40"
              />
              <Image
                src="/gtgc_logo.jpg"
                alt="GTGC OES"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full bg-white object-contain p-0.5 border border-[#D4AF37]/40"
              />
            </div>
            <div>
              <h2
                id="subscribe-modal-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading"
              >
                Subscribe to Jurisdictional Calendars
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sync live schedules directly to Apple Calendar, Microsoft Outlook, or Google Calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close subscription modal"
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#003366] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Master Combined Feed Option */}
          <div className="p-4 sm:p-5 rounded-xl border-2 border-[#D4AF37] bg-amber-50/30 dark:bg-[#07192F]/60 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
                </span>
                <span className="font-bold text-[#0B2545] dark:text-[#F8F9FA] text-sm font-heading">
                  Master Jurisdictional Calendar (All Feeds)
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#003366] text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-bold">
                Auto-Synced
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unified schedule across MWPHGLDC, Georgiana Thomas Grand Chapter O.E.S., and the Prince Hall Masonic Temple (PHFAMOESCEF).
            </p>

            {/* Direct Calendar Link Display with Copy */}
            <div className="flex items-center gap-2 p-1.5 pl-3 bg-white dark:bg-[#0B2545] rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
              <code className="font-mono text-slate-700 dark:text-slate-200 truncate flex-1 select-all text-[11px]">
                {masterHttpUrl}
              </code>
              <button
                onClick={() => handleCopy(masterHttpUrl, 'master-url')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#003366] hover:bg-slate-200 dark:hover:bg-[#07192F] text-[#003366] dark:text-[#D4AF37] font-bold transition-colors flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                title="Copy master calendar subscription link"
              >
                {copiedKey === 'master-url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href={masterWebcalUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#0B2545]" />
                Apple / Outlook
              </a>

              <a
                href={googleSubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 border-[#003366] dark:border-[#D4AF37] text-[#003366] dark:text-[#D4AF37] bg-white dark:bg-[#0B2545] hover:bg-[#003366] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#0B2545] transition-all text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                Google Calendar
              </a>

              <a
                href={masterHttpUrl}
                download="master.ics"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#07192F] text-slate-700 dark:text-slate-200 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Download (.ics)
              </a>
            </div>
          </div>

          {/* Individual Organization Subscriptions (Direct Pass-through Links to live .ics feeds) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-heading">
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              Subscribe to Individual Feeds
            </h3>

            <div className="space-y-2">
              {sources.map((src) => {
                // Pass-through links direct to the live upstream .ics URL
                const orgIcsUrl = src.icsUrl;
                const orgWebcal = src.icsUrl.replace(/^https?:\/\//i, 'webcal://');
                const orgGoogleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(src.icsUrl)}`;

                return (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#07192F]/60 hover:bg-slate-100 dark:hover:bg-[#07192F] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <OrgLogo orgId={src.id} size={24} className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-[#0B2545] dark:text-[#F8F9FA]">
                          {src.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>{src.sourceType === 'outlook' ? 'Outlook 365 Feed' : 'Google Public Calendar'}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">.ics</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={orgWebcal}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:border-[#D4AF37] text-[#003366] dark:text-[#D4AF37] transition-colors shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title={`Subscribe to ${src.name} in Apple Calendar or Outlook`}
                      >
                        Subscribe
                      </a>
                      <a
                        href={orgGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#003366] text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title={`Add ${src.name} directly to Google Calendar`}
                      >
                        Google
                      </a>
                      <button
                        onClick={() => handleCopy(orgIcsUrl, src.id)}
                        className="p-1.5 text-slate-500 hover:text-[#0B2545] dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#003366] transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title="Copy direct .ics feed URL"
                        aria-label={`Copy direct .ics feed URL for ${src.name}`}
                      >
                        {copiedKey === src.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with phfamoescef.com link */}
        <div className="p-4 bg-slate-50 dark:bg-[#07192F] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TaxExemptBadge />
            <LocationBadge />
            <WebsiteLinkBadge />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#003366] hover:bg-[#0B2545] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
