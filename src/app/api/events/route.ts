import { NextResponse } from 'next/server';
import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const orgId = searchParams.get('orgId') || undefined;
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('force') === 'true';

    let windowStart: Date | undefined;
    let windowEnd: Date | undefined;

    if (startParam) {
      const parsedStart = new Date(startParam);
      if (!isNaN(parsedStart.getTime())) {
        windowStart = parsedStart;
      }
    }

    if (endParam) {
      const parsedEnd = new Date(endParam);
      if (!isNaN(parsedEnd.getTime())) {
        windowEnd = parsedEnd;
      }
    }

    const data = await fetchAllCalendarFeeds({
      windowStart,
      windowEnd,
      targetOrgId: orgId,
      forceRefresh,
    });

    // Compute deterministic ETag based on events count, sources count, and timestamp
    const etagSource = `${data.events.length}-${data.sources.length}-${data.lastUpdated}`;
    let etagHash = 0;
    for (let i = 0; i < etagSource.length; i++) {
      etagHash = (etagHash << 5) - etagHash + etagSource.charCodeAt(i);
      etagHash |= 0;
    }
    const etag = `"${Math.abs(etagHash).toString(36)}-${data.events.length}"`;

    // Handle client conditional request (304 Not Modified)
    const clientIfNoneMatch = request.headers.get('if-none-match');
    if (!forceRefresh && clientIfNoneMatch && clientIfNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    const responseHeaders: Record<string, string> = {
      ETag: etag,
      'Cache-Control': forceRefresh
        ? 'no-store, no-cache, must-revalidate'
        : 'public, s-maxage=900, stale-while-revalidate=1800',
    };

    if (data.warnings.length > 0) {
      responseHeaders['X-Calendar-Warnings'] = encodeURIComponent(
        data.warnings.join(' | ')
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('API /api/events error:', error);
    return NextResponse.json(
      {
        events: [],
        sources: [],
        warnings: [`Server-side ingestion error: ${error?.message || String(error)}`],
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
