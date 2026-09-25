import { NextRequest, NextResponse } from 'next/server';
import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';
import { generateMasterIcs } from '@/lib/icsGenerator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org') || undefined;
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('force') === 'true';

    // Expand recurrence window for subscription feeds: past 30 days to next 365 days
    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const data = await fetchAllCalendarFeeds({
      windowStart,
      windowEnd,
      targetOrgId: orgId,
      forceRefresh,
    });

    const targetOrg = orgId
      ? data.sources.find((s) => s.id === orgId)
      : null;

    const calName = targetOrg
      ? `${targetOrg.name} Events`
      : 'Unified Community Calendar';

    const calDesc = targetOrg
      ? `Calendar feed for ${targetOrg.name}`
      : `Aggregated community calendar from ${data.sources.length} organizations`;

    const filename = targetOrg
      ? `${targetOrg.id}-events.ics`
      : 'combined-community-calendar.ics';

    // Fast ETag computation
    const etagSource = `${orgId || 'all'}-${data.events.length}-${data.lastUpdated}`;
    let etagHash = 0;
    for (let i = 0; i < etagSource.length; i++) {
      etagHash = (etagHash << 5) - etagHash + etagSource.charCodeAt(i);
      etagHash |= 0;
    }
    const etag = `"${Math.abs(etagHash).toString(36)}-${data.events.length}"`;

    const clientIfNoneMatch = request.headers.get('if-none-match');
    if (!forceRefresh && clientIfNoneMatch && clientIfNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    const icsContent = generateMasterIcs(data.events, calName, calDesc);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        ETag: etag,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': forceRefresh
          ? 'no-store, no-cache, must-revalidate'
          : 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error: any) {
    console.error('Error generating master ICS feed:', error);
    return new NextResponse(
      `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Community Calendar//EN\r\nEND:VCALENDAR\r\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
        },
      }
    );
  }
}
