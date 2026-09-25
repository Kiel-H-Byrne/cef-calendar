import { NextRequest, NextResponse } from 'next/server';
import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';
import { generateMasterIcs } from '@/lib/icsGenerator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId: rawOrgId } = await context.params;
    // Strip trailing .ics if requested as /api/calendar/org-alpha.ics
    const orgId = rawOrgId.replace(/\.ics$/i, '');
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('force') === 'true';

    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const data = await fetchAllCalendarFeeds({
      windowStart,
      windowEnd,
      targetOrgId: orgId,
      forceRefresh,
    });

    const targetOrg = data.sources.find((s) => s.id === orgId);
    if (!targetOrg) {
      return NextResponse.json({ error: `Organization "${orgId}" not found` }, { status: 404 });
    }

    const calName = `${targetOrg.name} Events`;
    const calDesc = `Direct calendar feed for ${targetOrg.name}`;
    const filename = `${targetOrg.id}-events.ics`;

    // Fast ETag computation
    const etagSource = `${orgId}-${data.events.length}-${data.lastUpdated}`;
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
