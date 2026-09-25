import { fetchAllCalendarFeeds } from '@/lib/feedFetcher';
import { CalendarHub } from '@/components/CalendarHub';

export const revalidate = 900; // 15-minute ISR page revalidation

export default async function HomePage() {
  const initialData = await fetchAllCalendarFeeds();

  return <CalendarHub initialData={initialData} />;
}
