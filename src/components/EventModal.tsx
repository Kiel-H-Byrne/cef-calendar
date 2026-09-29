'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Download,
  ExternalLink,
  X,
  Share2,
  Check,
} from 'lucide-react';
import { UnifiedCalendarEvent } from '@/config/calendars';
import { generateSingleEventIcs, getGoogleCalendarUrl } from '@/lib/icsGenerator';
import { FiveColorOesStrip, OrgLogo } from './FraternalEmblems';

interface EventModalProps {
  event: UnifiedCalendarEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const isOes = event.orgId === 'org-delta';

  // Format localized date and time
  const formatDateTimeRange = () => {
    try {
      if (event.allDay) {
        // Parse YYYY-MM-DD components directly to avoid timezone shift
        const [sYear, sMonth, sDay] = event.start.split('-').map(Number);
        const startDate = new Date(sYear, sMonth - 1, sDay);

        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        };

        if (event.end && event.end !== event.start) {
          const [eYear, eMonth, eDay] = event.end.split('-').map(Number);
          // iCal all-day DTEND is exclusive, so subtract 1 day for inclusive human display
          const exclusiveEndDate = new Date(eYear, eMonth - 1, eDay);
          const inclusiveEndDate = new Date(exclusiveEndDate.getTime() - 24 * 60 * 60 * 1000);

          if (inclusiveEndDate > startDate) {
            return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${inclusiveEndDate.toLocaleDateString(undefined, dateOptions)} (All-day)`;
          }
        }
        return `${startDate.toLocaleDateString(undefined, dateOptions)} (All-day)`;
      } else {
        const start = new Date(event.start);
        const end = new Date(event.end);

        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timeZoneName = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
          .formatToParts(start)
          .find((p) => p.type === 'timeZoneName')?.value;

        const datePart = start.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        const timeFormat: Intl.DateTimeFormatOptions = {
          hour: 'numeric',
          minute: '2-digit',
        };

        const startTime = start.toLocaleTimeString(undefined, timeFormat);
        const endTime = end.toLocaleTimeString(undefined, timeFormat);

        return {
          date: datePart,
          time: `${startTime} – ${endTime} (${timeZoneName || userTimezone})`,
        };
      }
    } catch {
      return { date: event.start, time: event.end };
    }
  };

  const dateTimeInfo = formatDateTimeRange();

  // Detect virtual vs physical location
  const isVirtual =
    event.location &&
    (event.location.startsWith('http://') ||
      event.location.startsWith('https://') ||
      /zoom\.us|teams\.microsoft|meet\.google|webex/i.test(event.location));

  const mapsUrl = event.location && !isVirtual
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  // Single event .ics download
  const handleDownloadIcs = () => {
    const icsString = generateSingleEventIcs(event);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `${safeTitle || 'masonic-event'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Calendar web link
  const googleCalUrl = getGoogleCalendarUrl(event);

  // Copy event details
  const handleCopyDetails = async () => {
    const timeText =
      typeof dateTimeInfo === 'string'
        ? dateTimeInfo
        : `${dateTimeInfo.date} • ${dateTimeInfo.time}`;

    const textToCopy = [
      event.title,
      `Jurisdiction / Organization: ${event.orgName}`,
      `When: ${timeText}`,
      event.location ? `Location: ${event.location}` : '',
      event.description ? `\n${event.description}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy event details:', err);
    }
  };

  // Convert raw text into elements with auto-linked URLs
  const renderFormattedDescription = (text?: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#003366] dark:text-[#D4AF37] font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 break-all hover:text-[#B8952E]"
          >
            {part}
            <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0B2545] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: event.backgroundColor }}
        />
        {isOes && <FiveColorOesStrip className="h-1 w-full" />}

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close event modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Org Pill Badge with Official Logo */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs border"
              style={{
                backgroundColor: event.backgroundColor,
                color: event.textColor,
                borderColor: event.borderColor,
              }}
            >
              <OrgLogo orgId={event.orgId} size={18} className="w-4.5 h-4.5" />
              {event.orgName}
            </span>
          </div>

          {/* Title */}
          <h2
            id="event-modal-title"
            className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-[#F8F9FA] tracking-tight font-heading"
          >
            {event.title}
          </h2>

          {/* Date & Time */}
          <div className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#07192F] text-[#003366] dark:text-[#D4AF37] border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-[#0B2545] dark:text-white text-sm sm:text-base">
                {typeof dateTimeInfo === 'string'
                  ? dateTimeInfo
                  : dateTimeInfo.date}
              </div>
              {typeof dateTimeInfo !== 'string' && (
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {dateTimeInfo.time}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#07192F] text-[#003366] dark:text-[#D4AF37] border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
                {isVirtual ? (
                  <Video className="w-5 h-5 text-blue-500" />
                ) : (
                  <MapPin className="w-5 h-5 text-[#C0392B]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm sm:text-base font-semibold text-[#0B2545] dark:text-white break-words">
                  {event.location}
                </div>
                {isVirtual ? (
                  <a
                    href={event.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] dark:text-[#D4AF37] hover:underline"
                  >
                    Join Video Conference <ExternalLink className="w-3 h-3" />
                  </a>
                ) : mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] dark:text-[#D4AF37] hover:underline"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Event Description &amp; Details
              </h3>
              <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {renderFormattedDescription(event.description)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#07192F] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B2545] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#003366] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              title="Copy event details to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  Share Details
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Secondary Button: Fraternal Blue Outline */}
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border-2 border-[#003366] dark:border-[#D4AF37] text-[#003366] dark:text-[#D4AF37] bg-transparent hover:bg-[#003366] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#0B2545] transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Calendar
            </a>

            {/* Primary Action Button: Imperial Gold CTA */}
            <button
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#D4AF37] hover:bg-[#B8952E] text-[#0B2545] transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(212,175,55,0.3)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <Download className="w-3.5 h-3.5" />
              Download .ics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
