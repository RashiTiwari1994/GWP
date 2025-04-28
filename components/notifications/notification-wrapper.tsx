'use client';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import PageHeader from '../page-header';

const Notification = dynamic(() => import('@/components/notifications/notification'), {
  ssr: false,
});

export default function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="My Notifications"
        description="Manage and send notifications to your passes"
        buttonLabel="Create New Notification"
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Notification isOpen={isOpen} setIsOpen={setIsOpen} />
      </Dialog>
    </>
  );
}
