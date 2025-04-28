import { Button } from '@/components/ui/button';
import React from 'react';
import { Wallet } from 'lucide-react';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharePassPage({ params }: PageProps) {
  const resolvedParams = await params;
  const shareId = resolvedParams.shareId;
  console.log(shareId);

  return (
    <div className="pt-8 h-screen fixed inset-0 overflow-y-auto flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Digital Pass</h1>
        <p className="text-gray-600 mb-8">
          Add this pass to your Google Wallet to access exclusive benefits.
        </p>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg flex items-center justify-center gap-2">
          <Wallet className="w-5 h-5" />
          Add to Google Wallet
        </Button>
      </div>
    </div>
  );
}
