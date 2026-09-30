import { NextRequest, NextResponse } from 'next/server';
import { getCalendarSources } from '@/config/calendars';
import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';
import { generateMasterIcs } from '@/lib/icsGenerator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId: rawOrgId } = await context.params;
    // Strip trailing .ics if requested as /api/calendar/org-alpha.ics or /api/calendar/master.ics
    const orgId = rawOrgId.replace(/\.ics$/i, '');
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('force') === 'true';

    // Handle master / all calendar request directly
    if (orgId === 'master' || orgId === 'all') {
      const now = new Date();
      const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      const data = await fetchAllCalendarFeeds({
        windowStart,
        windowEnd,
        forceRefresh,
      });

      const calName = 'Prince Hall Masonic Temple & Jurisdictional Calendar';
      const calDesc = 'Unified Jurisdictional Schedule for MWPHGLDC, GTGC, PHFAMOESCEF, and THC';
      const icsContent = generateMasterIcs(data.events, calName, calDesc);

      // Fast ETag computation
      const etagSource = `master-${data.events.length}-${data.lastUpdated}`;
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

      return new NextResponse(icsContent, {
        status: 200,
        headers: {
          ETag: etag,
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="master.ics"',
          'Cache-Control': forceRefresh
            ? 'no-store, no-cache, must-revalidate'
            : 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      });
    }

    // Match individual organization source
    const allSources = getCalendarSources();
    const targetOrg = allSources.find(
      (s) => s.id === orgId || s.shortName.toLowerCase() === orgId.toLowerCase()
    );

    if (!targetOrg) {
      return NextResponse.json({ error: `Organization "${orgId}" not found` }, { status: 404 });
    }

    // Pass-through link directly to the original upstream feed (.ics)
    // 307 Temporary Redirect preserves HTTP method and directs subscribers straight to the source
    return NextResponse.redirect(targetOrg.icsUrl, 307);
  } catch (error: unknown) {
    console.error('Error handling calendar route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
