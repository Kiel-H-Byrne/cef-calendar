'use client';

import React from 'react';
import { OrgCalendarConfig } from '@/config/calendars';
import { SITE } from '@/config/site';
import { OrgLogo } from './FraternalEmblems';

interface PrintHeaderProps {
  title: string;
  sources: OrgCalendarConfig[];
  selectedOrgIds: Set<string>;
  searchQuery?: string;
  totalEvents: number;
}

export function PrintHeader({
  title,
  sources,
  selectedOrgIds,
  searchQuery,
  totalEvents,
}: PrintHeaderProps) {
  const activeSources = sources.filter((s) => selectedOrgIds.has(s.id));
  const isFiltered = activeSources.length < sources.length;

  const nowFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="hidden print:block mb-2.5 pb-2 border-b-2 border-[#D4AF37] text-black">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#0B2545] font-heading">
            {SITE.name}
          </h1>
          <p className="text-[10px] text-slate-600">
            Prince Hall Masonic Temple • 1000 U Street NW, Washington, D.C. 20001
          </p>
        </div>

        {/* Calendar Title & Print Date */}
        <div className="text-right">
          <div className="text-sm font-bold text-[#003366] font-heading">
            {title || 'Calendar Schedule'}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            Printed {nowFormatted} • {totalEvents} {totalEvents === 1 ? 'Event' : 'Events'}
          </div>
        </div>
      </div>

      {/* Filter / Search Details & Legend */}
      <div className="mt-1.5 pt-1 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap text-[10px]">
        {/* Active Organizations Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#0B2545] uppercase tracking-wider text-[9px]">
            Legend:
          </span>
          {activeSources.map((src) => (
            <div
              key={src.id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-300 text-[9px] font-semibold"
            >
              <span
                className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: src.color.primary }}
              />
              <OrgLogo orgId={src.id} size={12} className="w-3 h-3 flex-shrink-0" />
              <span>{src.shortName?.toUpperCase() || src.name}</span>
            </div>
          ))}
        </div>

        {/* Filter / Search Status */}
        <div className="text-[9px] text-slate-600 italic">
          {searchQuery && (
            <span className="mr-2 font-semibold not-italic text-[#003366]">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          {isFiltered ? (
            <span>
              Showing {activeSources.length} of {sources.length} organizations
            </span>
          ) : (
            <span>All organizations included</span>
          )}
        </div>
      </div>
    </div>
  );
}

