import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

async function handleRevalidate(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || 'calendar-feeds';
    const secret = searchParams.get('secret');

    // If REVALIDATE_SECRET is set in environment, check it
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid revalidation secret' }, { status: 401 });
    }

    // Instantly invalidate the tagged fetch cache entries
    revalidateTag(tag);

    // Invalidate the ISR pre-rendered home page
    revalidatePath('/');
    revalidatePath('/api/events');

    return NextResponse.json({
      revalidated: true,
      tag,
      now: new Date().toISOString(),
      message: `Successfully purged cache for tag: ${tag} and refreshed route paths.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        revalidated: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
