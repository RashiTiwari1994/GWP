'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DialogTitle } from '@radix-ui/react-dialog';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { PassData } from '@/types/types';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationSchema, NotificationFormData } from '../../lib/zod/pass-zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createNotification } from '@/actions/notification';

interface NotificationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Notification({ setIsOpen }: NotificationProps) {
  const { data } = useSWR('/api/passes', fetcher);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      passType: '',
      notificationName: '',
      message: '',
    },
  });

  const onSubmit = async (values: NotificationFormData) => {
    setIsLoading(true);

    try {
      const result = await createNotification({
        passType: values.passType,
        message: values.message,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Notification sent successfully!',
        description: 'The notification has been sent to the selected pass.',
      });

      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="font-bold">Create Notification</DialogTitle>
          </DialogHeader>
          <FormField
            control={form.control}
            name="passType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full border-2">
                      <SelectValue placeholder="Select a pass" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {data?.passes.map(
                          (pass: PassData) =>
                            pass.id && (
                              <SelectItem key={pass.id} value={pass.id}>
                                {pass.name}
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notificationName"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 items-center gap-4">
                  <div>
                    <FormLabel className="font-bold text-gray-700">Notification Name</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Will not be visible, used for organization purposes
                    </p>
                  </div>
                  <FormControl>
                    <Input {...field} className="col-span-3 border-2" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 items-center gap-4">
                  <FormLabel className="font-bold">What do you want your message to say?</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3 border-2" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              {isLoading ? 'Sending...' : 'Send Now'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
