import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { FormData } from '@/lib/zod/pass-zod';
import { UseFormReturn } from 'react-hook-form';
import ImageUpload from './image-upload';
import { toast } from '@/hooks/use-toast';

interface FrontPassProps {
  form: UseFormReturn<FormData>;
  onImageSelected: (file: File, type: 'logo' | 'cover') => void;
  isLoading?: boolean;
}

export default function FrontPass({ form, onImageSelected, isLoading = false }: FrontPassProps) {
  const handleImageUpload = (file: File, croppedImageUrl: string, type: 'logo' | 'cover') => {
    try {
      form.setValue(
        type === 'logo' ? 'customization.logoUrl' : 'customization.coverImgUrl',
        croppedImageUrl
      );
      onImageSelected(file, type);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Error processing ${type} image`;
      console.error(`Error processing ${type} image:`, error);
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-300px)] px-2 overflow-y-auto">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pass Type</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="loyaltyCard">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select pass type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loyaltyCard">Loyalty Card</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pass Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Logo <span className="text-xs text-gray-500">(Recommended size: 200x200px)</span>
            </FormLabel>
            <FormControl>
              <ImageUpload
                label="Logo"
                previewUrl={field.value}
                onImageSelected={(file, croppedImageUrl) =>
                  handleImageUpload(file, croppedImageUrl, 'logo')
                }
                isLoading={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.coverImgUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Cover Image{' '}
              <span className="text-xs text-gray-500">(Recommended size: 1024x576px)</span>
            </FormLabel>
            <FormControl>
              <ImageUpload
                label="Cover"
                previewUrl={field.value}
                onImageSelected={(file, croppedImageUrl) =>
                  handleImageUpload(file, croppedImageUrl, 'cover')
                }
                isLoading={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.websiteUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website URL</FormLabel>
            <FormControl>
              <Input type="url" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.websiteText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website Text</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.backgroundColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background Color</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="color"
                    {...field}
                    value={field.value || '#000000'}
                    className="h-10 w-full cursor-pointer border rounded-md"
                  />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customization.notificationTitle"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Notification Title</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Keep it short and engaging (max 30 characters)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input {...field} maxLength={30} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
