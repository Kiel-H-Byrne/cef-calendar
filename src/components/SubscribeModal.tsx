'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  Download,
  Rss,
  X,
  Smartphone,
  Globe,
  Radio,
} from 'lucide-react';
import { OrgCalendarConfig } from '@/config/calendars';
import {
  MasonicEmblem,
  EasternStarEmblem,
  TaxExemptBadge,
  LocationBadge,
} from './FraternalEmblems';

interface SubscribeModalProps {
  sources: OrgCalendarConfig[];
  isOpen: boolean;
  onClose: () => void;
}

export function SubscribeModal({ sources, isOpen, onClose }: SubscribeModalProps) {
  const [origin, setOrigin] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

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

  const hostWithProto = origin || 'http://localhost:3000';
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
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#0B2545] border-b border-[#D4AF37] flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#003366] text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="subscribe-modal-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading"
              >
                Subscribe to Jurisdictional Calendars
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sync live schedules to Apple Calendar, Microsoft Outlook, or Google Calendar
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
                  Master Jurisdictional Feed (All Organizations)
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#003366] text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-bold">
                Auto-Synced
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Aggregates all jurisdictional events from MWPHGLDC, Georgiana Thomas Grand Chapter O.E.S., and the Prince Hall Masonic Temple (PHFAMOESCEF).
            </p>

            {/* URL Display with Copy */}
            <div className="flex items-center gap-2 p-1.5 pl-3 bg-white dark:bg-[#0B2545] rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
              <code className="font-mono text-slate-700 dark:text-slate-200 truncate flex-1 select-all text-[11px]">
                {masterWebcalUrl}
              </code>
              <button
                onClick={() => handleCopy(masterWebcalUrl, 'master-webcal')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#003366] hover:bg-slate-200 dark:hover:bg-[#07192F] text-[#003366] dark:text-[#D4AF37] font-bold transition-colors flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                {copiedKey === 'master-webcal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
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
                download="prince-hall-jurisdictional-calendar.ics"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#07192F] text-slate-700 dark:text-slate-200 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export .ics
              </a>
            </div>
          </div>

          {/* Individual Organization Subscriptions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-heading">
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              Subscribe to Individual Feeds
            </h3>

            <div className="space-y-2">
              {sources.map((src) => {
                const orgWebcal = `${hostWithProto}/api/calendar/${src.id}`.replace(/^https?:\/\//i, 'webcal://');
                const orgIcsUrl = `${hostWithProto}/api/calendar/${src.id}`;
                const orgGoogleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(orgIcsUrl)}`;
                const isOes = src.id === 'org-delta';

                return (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#07192F]/60 hover:bg-slate-100 dark:hover:bg-[#07192F] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {isOes ? (
                        <EasternStarEmblem className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <MasonicEmblem className="w-5 h-5 flex-shrink-0" color={src.color.primary === '#003366' ? '#D4AF37' : src.color.primary} />
                      )}
                      <div>
                        <div className="text-sm font-bold text-[#0B2545] dark:text-[#F8F9FA]">
                          {src.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {src.sourceType === 'outlook' ? 'Outlook 365 Feed' : 'Google Public Calendar'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={orgWebcal}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:border-[#D4AF37] text-[#003366] dark:text-[#D4AF37] transition-colors shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title={`Subscribe to ${src.name} via webcal`}
                      >
                        Subscribe
                      </a>
                      <a
                        href={orgGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#0B2545] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#003366] text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title={`Add ${src.name} to Google Calendar`}
                      >
                        Google
                      </a>
                      <button
                        onClick={() => handleCopy(orgWebcal, src.id)}
                        className="p-1.5 text-slate-500 hover:text-[#0B2545] dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-[#003366] transition-colors focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        title="Copy feed URL"
                        aria-label={`Copy feed link for ${src.name}`}
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

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#07192F] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TaxExemptBadge />
            <LocationBadge />
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
