import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { FormData } from '@/lib/zod/pass-zod';

export default function SuccessView({
  formValues,
  mode,
  passUrl,
}: {
  formValues: FormData;
  mode: string;
  passUrl: string;
}) {
  const copySharePassURL = (url: string | null) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Pass URL copied to clipboard',
      description: 'You can now share the pass URL with your friends',
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 backdrop-blur-sm p-6">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Success!</h2>
        <p className="text-xl text-gray-700">
          Your {formValues.name} Pass has been {mode === 'create' ? 'created' : 'updated'}!
        </p>
      </div>

      <div className="flex flex-col justify-center items-center mt-4 gap-2 text-white px-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <QRCodeSVG value={passUrl} size={200} className="w-full h-full" />
        </div>
        <p className="text-center mt-4 text-gray-600">Scan QR to add your Pass</p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <Button
          className="w-full bg-primary hover:bg-primary/80 text-white transition-colors duration-300"
          onClick={() => copySharePassURL(passUrl)}
        >
          Share Pass ↑
        </Button>
        <Link href="/passes">
          <Button variant="outline" className="w-full">
            Back to My Passes
          </Button>
        </Link>
      </div>
    </div>
  );
}
