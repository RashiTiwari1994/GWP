import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '@/lib/zod/pass-zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
interface BackPassProps {
  form: UseFormReturn<FormData>;
}

export default function BackPass({ form }: BackPassProps) {
  const textFields = form.watch('customization.textFields') || [];
  const linkModules = form.watch('customization.linkModules') || [];

  const addTextField = () => {
    if (textFields.length >= 5) {
      toast({
        title: 'Error',
        description: 'You can only add up to 5 text fields',
        variant: 'destructive',
      });
      return false;
    }
    const currentFields = form.getValues('customization.textFields') || [];
    form.setValue('customization.textFields', [
      ...currentFields,
      { title: '', displayText: '', url: '' },
    ]);
  };

  const removeTextField = (index: number) => {
    const currentFields = form.getValues('customization.textFields') || [];
    form.setValue(
      'customization.textFields',
      currentFields.filter((_, i) => i !== index)
    );
  };

  const addLinkModule = () => {
    const currentLinks = form.getValues('customization.linkModules') || [];
    form.setValue('customization.linkModules', [...currentLinks, { title: '', url: '' }]);
  };

  const removeLinkModule = (index: number) => {
    const currentLinks = form.getValues('customization.linkModules') || [];
    form.setValue(
      'customization.linkModules',
      currentLinks.filter((_, i) => i !== index)
    );
  };

  return (
    <Card className="p-4">
      <h1 className="text-lg font-medium mb-1">Add content to the Pass</h1>
      <div className="flex flex-col gap-4">
        <div>
          <Button type="button" variant="outline" onClick={addTextField} className="mb-2 mt-2">
            Add Text Field
          </Button>
          <div className="text-sm mb-4">You can add up to 5 text fields.</div>

          {textFields.map((_, index) => (
            <div key={index} className="flex flex-col gap-2 border p-4 rounded-lg relative mb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeTextField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <FormField
                control={form.control}
                name={`customization.textFields.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`customization.textFields.${index}.displayText`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter display text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`customization.textFields.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="Enter URL"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div>
          <Button type="button" variant="outline" onClick={addLinkModule} className="mb-4">
            Add Link Module
          </Button>

          {linkModules.map((_, index) => (
            <div key={index} className="flex flex-col gap-2 border p-4 rounded-lg relative mb-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeLinkModule(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <FormField
                control={form.control}
                name={`customization.linkModules.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter link title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`customization.linkModules.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="Enter URL"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
