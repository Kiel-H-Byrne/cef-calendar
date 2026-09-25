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

    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const data = await fetchAllCalendarFeeds({
      windowStart,
      windowEnd,
      targetOrgId: orgId,
    });

    const targetOrg = data.sources.find((s) => s.id === orgId);
    if (!targetOrg) {
      return NextResponse.json({ error: `Organization "${orgId}" not found` }, { status: 404 });
    }

    const calName = `${targetOrg.name} Events`;
    const calDesc = `Direct calendar feed for ${targetOrg.name}`;
    const filename = `${targetOrg.id}-events.ics`;

    const icsContent = generateMasterIcs(data.events, calName, calDesc);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
