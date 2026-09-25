import { NextResponse } from 'next/server';
import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';

export const dynamic = 'force-dynamic'; // Allows dynamic query param processing while fetch() handles internal 15-min ISR caching

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const orgId = searchParams.get('orgId') || undefined;

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
    });

    const responseHeaders: Record<string, string> = {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
    };

    if (data.warnings.length > 0) {
      // Header sanitized to prevent illegal header characters
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
