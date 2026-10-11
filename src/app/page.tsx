import { fetchAllCalendarFeeds, toClientPayload } from '@/lib/feedFetcher';
import { CalendarHub } from '@/components/CalendarHub';

export const revalidate = 900; // 15-minute ISR page revalidation

export default async function HomePage() {
  const data = await fetchAllCalendarFeeds();

  // Only the browser-safe subset crosses to the client (no upstream URLs or error details)
  return <CalendarHub initialData={toClientPayload(data)} />;
}
