'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { passSchema } from '@/lib/zod/pass-zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { PassData } from '@/types/types';
import PassPreview from '@/components/pass-preview';
import SuccessView from '@/components/passes/success-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FrontPass from '@/components/passes/google-wallet/front-pass';
import { Form } from '@/components/ui/form';
import BackPass from '@/components/passes/google-wallet/back-pass';
import { createPass, updatePass } from '@/actions/passes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { uploadToS3 } from '@/lib/s3-upload';

type FormData = z.infer<typeof passSchema>;

interface PassFormProps {
  initialData?: PassData | undefined;
  mode: 'create' | 'edit';
  passId?: string;
}

export default function PassForm({ initialData, mode, passId }: PassFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passUrl, setPassUrl] = useState(initialData?.url || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(passSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {
      type: initialData?.type || 'loyaltyCard',
      name: initialData?.name || '',
      customization: {
        websiteUrl: initialData?.customization[0]?.websiteUrl || '',
        logoUrl: initialData?.customization[0]?.logoUrl || '',
        backgroundColor: initialData?.customization[0]?.backgroundColor || '#000000',
        coverImgUrl: initialData?.customization[0]?.coverImgUrl || '',
        notificationTitle: initialData?.customization[0]?.notificationTitle || '',
        websiteText: initialData?.customization[0]?.qrText || '',
        textFields: Array.isArray(initialData?.customization[0]?.textFields)
          ? initialData?.customization[0]?.textFields
          : [],
        linkModules: Array.isArray(initialData?.customization[0]?.linkModules)
          ? initialData?.customization[0]?.linkModules
          : [],
      },
    },
  });

  const handleImageSelected = (file: File, type: 'logo' | 'cover') => {
    if (type === 'logo') {
      setLogoFile(file);
    } else {
      setCoverFile(file);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      let logoUrl = data.customization.logoUrl;
      let coverUrl = data.customization.coverImgUrl;

      if (logoFile) {
        try {
          logoUrl = await uploadToS3(logoFile, 'passes/logos');
        } catch (error) {
          console.error('Error uploading logo to S3:', error);
          setIsLoading(false);
          return;
        }
      }
      if (coverFile) {
        try {
          coverUrl = await uploadToS3(coverFile, 'passes/covers');
        } catch (error) {
          console.error('Error uploading cover to S3:', error);
          toast({
            title: 'Upload Error',
            description: 'Failed to upload cover image. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      const passData: PassData = {
        type: data.type,
        name: data.name,
        url: initialData?.url || null,
        customization: [
          {
            logoUrl: logoUrl,
            coverImgUrl: coverUrl,
            websiteUrl: data.customization.websiteUrl || null,
            qrUrl: data.customization.websiteUrl || null,
            qrText: data.customization.websiteText || null,
            backgroundColor: data.customization.backgroundColor,
            notificationTitle: data.customization.notificationTitle || null,
            textFields: data.customization.textFields || [],
            linkModules: data.customization.linkModules || [],
          },
        ],
      };

      let result;
      if (mode === 'create') {
        result = await createPass(passData);
      } else if (mode === 'edit' && passId) {
        result = await updatePass(passId, passData);
      }
      if (result?.success) {
        if (result.url) {
          setPassUrl(result.url);
        }
        toast({
          title: 'Success',
          description: `Pass ${mode === 'create' ? 'created' : 'updated'} successfully!`,
        });
        setShowSuccess(true);
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} pass:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} pass. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Link href="/passes">
        <ArrowLeft size={25} className="text-primary bg-gray-200 p-1 ml-4 mt-4 rounded-full" />
      </Link>
      <div className="grid md:grid-cols-2 gap-4 items-start max-w-6xl mt-5 mx-auto">
        {showSuccess ? (
          <SuccessView formValues={form.getValues()} mode={mode} passUrl={passUrl} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 backdrop-blur-sm">
            <h1 className="text-2xl font-semibold text-gray-900 p-4 text-center">
              {mode === 'create' ? 'Create' : 'Edit'} Your Digital Pass
            </h1>
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                  <Tabs defaultValue="front" className="w-full px-4">
                    <TabsList className="flex justify-between">
                      <TabsTrigger value="front" className="w-full">
                        Front
                      </TabsTrigger>
                      <TabsTrigger value="back" className="w-full">
                        Back
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="front">
                      <FrontPass
                        form={form}
                        onImageSelected={handleImageSelected}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                    <TabsContent value="back">
                      <BackPass form={form} />
                    </TabsContent>
                  </Tabs>
                  <div className="p-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300"
                    >
                      {isLoading ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
        {/* preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <PassPreview form={form} />
        </div>
      </div>
    </>
  );
}
