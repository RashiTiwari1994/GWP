import { FormData } from '@/lib/zod/pass-zod';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Cuboid, Earth, Ellipsis } from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface ScannerPreviewProps {
  form: UseFormReturn<FormData>;
}

export default function PassPreview({ form }: ScannerPreviewProps) {
  const [name, customization] = useWatch({
    control: form.control,
    name: ['name', 'customization'],
  });
  const {
    logoUrl,
    backgroundColor,
    coverImgUrl,
    websiteUrl,
    websiteText,
    textFields,
    linkModules,
  } = customization;

  const FrontPassCard = () => (
    <Card className="w-[320px] h-[470px] rounded-xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className={`h-[75%] relative`} style={{ backgroundColor: backgroundColor || '#000000' }}>
        <div className="flex gap-2 items-start border-b border-gray-100/20 p-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          ) : (
            <div className="flex gap-2 items-start">
              <Cuboid className="text-white" size={35} />
              <span className="text-lg font-semibold text-white">Passport</span>
            </div>
          )}
        </div>
        <div className="text-white p-4 pt-2">
          <h1 className="text-lg font-medium">{name || 'Your pass name'}</h1>
        </div>
        <div className="flex flex-col gap-1 text-white px-4">
          <h3 className="text-xs font-medium tracking-wide">SEE OFFERS</h3>
          <h2 className="flex gap-2 items-center text-white">
            TAP{' '}
            <span>
              <Ellipsis />
            </span>{' '}
            ABOVE{' '}
          </h2>
        </div>
        <div className="flex flex-col justify-center items-center mt-4 gap-2 text-white px-4">
          {websiteUrl && (
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <QRCodeSVG value={websiteUrl} size={115} className="w-full h-full" />
            </div>
          )}
          {websiteText && <h3 className="text-xs text-white/90 mt-1">{websiteText}</h3>}
        </div>
      </div>
      <div className="bg-gray-100 h-[25%]">
        {coverImgUrl ? (
          <Image
            src={coverImgUrl}
            alt="Cover"
            width={320}
            height={115}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100"></div>
        )}
      </div>
    </Card>
  );

  const BackPassCard = () => (
    <Card className="w-[320px] h-[470px] rounded-xl overflow-hidden shadow-sm border border-gray-200 p-4">
      <div className="flex gap-2 items-start ">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo"
            width={100}
            height={100}
            className="w-12 h-12 object-cover rounded-full"
          />
        ) : (
          <div className="flex gap-2 items-start">
            <Cuboid />
            <span className="text-lg font-semibold text-white">Passport</span>
          </div>
        )}
      </div>
      <h1 className="text-lg font-medium  pb-4">{name || 'Your pass name'}</h1>

      {textFields?.map((field, index) => (
        <div key={index} className="py-4">
          <h4 className="font-medium">{field.title}</h4>
          <p className="text-sm">
            {field.url ? (
              <a
                href={field.url}
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {field.displayText}
              </a>
            ) : (
              field.displayText
            )}
          </p>
        </div>
      ))}
      {linkModules && linkModules.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200 pb-4">
          {linkModules?.map((field, index) => (
            <div key={index} className="mt-2">
              <div className="flex items-center gap-2">
                <Earth size={16} />
                <h4 className="font-medium">{field.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const NotificationPreview = () => (
    <div className="bg-gray-50 p-4 max-w-lg mx-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Notification Icon"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          ) : (
            <Cuboid className="rounded-full text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {customization.notificationTitle || 'Notification Title'}
          </p>
          <p className="text-sm text-gray-500">
            This is how your push notifications will appear to your audience.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex">
        <h2 className="text-lg font-medium">Preview</h2>
        <Tabs defaultValue="front" className="max-w-lg mx-auto">
          <TabsList className="grid  grid-cols-2 mb-4">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>

          <TabsContent value="front">
            <div className="flex justify-center">
              <FrontPassCard />
            </div>
          </TabsContent>

          <TabsContent value="back">
            <div className="flex justify-center">
              <BackPassCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <NotificationPreview />
    </div>
  );
}
