'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  Rss,
  X,
  Smartphone,
  Globe,
  Radio,
} from 'lucide-react';
import { OrgCalendarConfig } from '@/config/calendars';

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
  // Replace http:// or https:// with webcal://
  const masterWebcalUrl = masterHttpUrl.replace(/^https?:\/\//i, 'webcal://');

  // Google Calendar one-click import via webcal cid parameter
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="subscribe-modal-title"
                className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                Subscribe to Calendar
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Sync live events directly into Apple Calendar, Outlook, or Google Calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close subscription modal"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Master Combined Feed Option */}
          <div className="p-4 rounded-xl border-2 border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Combined Master Feed (All 4 Organizations)
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
                Auto-Synced
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Aggregates all scheduled events from every partner non-profit. Your calendar client refreshes updates automatically.
            </p>

            {/* URL Display with Copy */}
            <div className="flex items-center gap-2 p-1.5 pl-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
              <code className="font-mono text-zinc-600 dark:text-zinc-300 truncate flex-1 select-all">
                {masterWebcalUrl}
              </code>
              <button
                onClick={() => handleCopy(masterWebcalUrl, 'master-webcal')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium transition-colors flex-shrink-0"
              >
                {copiedKey === 'master-webcal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
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

            {/* Quick 1-Click Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href={masterWebcalUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs text-center"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Apple / Outlook
              </a>

              <a
                href={googleSubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors text-center"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                Google Calendar
              </a>

              <a
                href={masterHttpUrl}
                download="combined-community-calendar.ics"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors text-center"
              >
                <Download className="w-3.5 h-3.5" />
                Export .ics
              </a>
            </div>
          </div>

          {/* Individual Organization Subscriptions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Subscribe to Individual Organizations
            </h3>

            <div className="space-y-2">
              {sources.map((src) => {
                const orgWebcal = `${hostWithProto}/api/calendar/${src.id}`.replace(/^https?:\/\//i, 'webcal://');
                const orgIcsUrl = `${hostWithProto}/api/calendar/${src.id}`;
                const orgGoogleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(orgIcsUrl)}`;

                return (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: src.color.primary }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {src.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {src.sourceType === 'outlook' ? 'Outlook on the web' : 'Google Calendar'} feed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={orgWebcal}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                        title={`Subscribe to ${src.name} via webcal`}
                      >
                        Subscribe
                      </a>
                      <a
                        href={orgGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                        title={`Add ${src.name} to Google Calendar`}
                      >
                        Google
                      </a>
                      <button
                        onClick={() => handleCopy(orgWebcal, src.id)}
                        className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title="Copy feed URL"
                      >
                        {copiedKey === src.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
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
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
