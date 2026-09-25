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
  Building2,
} from 'lucide-react';
import { UnifiedCalendarEvent } from '@/config/calendars';
import { generateSingleEventIcs, getGoogleCalendarUrl } from '@/lib/icsGenerator';

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
    link.download = `${safeTitle || 'event'}.ics`;
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
      `Organization: ${event.orgName}`,
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
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 break-all font-medium"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Org Banner */}
        <div
          className="h-3.5 w-full"
          style={{ backgroundColor: event.backgroundColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close event modal"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Org Pill Badge */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: event.backgroundColor,
                color: event.textColor,
              }}
            >
              <Building2 className="w-3.5 h-3.5" />
              {event.orgName}
            </span>
          </div>

          {/* Title */}
          <h2
            id="event-modal-title"
            className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
          >
            {event.title}
          </h2>

          {/* Date & Time */}
          <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                {typeof dateTimeInfo === 'string'
                  ? dateTimeInfo
                  : dateTimeInfo.date}
              </div>
              {typeof dateTimeInfo !== 'string' && (
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {dateTimeInfo.time}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5">
                {isVirtual ? (
                  <Video className="w-5 h-5 text-blue-500" />
                ) : (
                  <MapPin className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 break-words">
                  {event.location}
                </div>
                {isVirtual ? (
                  <a
                    href={event.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Join Video Conference <ExternalLink className="w-3 h-3" />
                  </a>
                ) : mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Description
              </h3>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {renderFormattedDescription(event.description)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title="Copy event details to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  Share Details
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Calendar
            </a>

            <button
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors shadow-xs"
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
