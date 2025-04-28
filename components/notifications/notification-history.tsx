import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Notification } from '@/types/types';
import { getNotifications } from '@/actions/notification';
import Image from 'next/image';

export default async function NotificationHistory() {
  const { notifications, error } = await getNotifications();
  if (error) {
    return <div className="text-red-500">Failed to fetch notifications</div>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-gray-200 rounded-xl max-w-5xl mx-auto">
        <Image src="/no-data.svg" alt="Empty State" width={200} height={200} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2 mt-4">
          You have not received any notifications yet.
        </h3>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <CardContent>
        <div className="h-[400px] w-full overflow-y-auto">
          <div className="space-y-4">
            {notifications.map((notification: Notification) => (
              <Card key={notification.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{notification.pass.name}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(notification.sentAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
