import NotificationHistory from '@/components/notifications/notification-history';
import NotificationWrapper from '@/components/notifications/notification-wrapper';

export const dynamic = 'force-dynamic';

export default async function NotificationPage() {
  return (
    <>
      <NotificationWrapper />
      <NotificationHistory />
    </>
  );
}
