import { z } from 'zod';

const textFieldSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  displayText: z.string().min(1, 'Display text is required'),
  url: z.string().url('Must be a valid URL').optional().nullable(),
});

const linkModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL').optional().nullable(),
  description: z.string().optional(),
});

const passCustomizationSchema = z.object({
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteText: z.string().optional(),
  logoUrl: z.string().min(1, 'Logo is required'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color code'),
  coverImgUrl: z.string().min(1, 'Cover image is required'),
  notificationTitle: z
    .string()
    .min(1, 'Notification title is required')
    .max(30, 'Notification title must not exceed 30 characters'),
  textFields: z.array(textFieldSchema).optional(),
  linkModules: z.array(linkModuleSchema).optional(),
});

export const passSchema = z.object({
  type: z.enum(['eventTicket', 'loyaltyCard', 'giftCard', 'offerCard', 'flightCard']),
  name: z.string().min(1, 'Name is required').max(30, 'Name must not exceed 30 characters'),
  customization: passCustomizationSchema,
});

export const notificationSchema = z.object({
  passType: z.string().min(1, 'Please select a pass'),
  notificationName: z
    .string()
    .min(1, 'Notification name is required')
    .max(30, 'Notification name must not exceed 30 characters'),
  message: z.string().min(1, 'Message is required'),
});

export type FormData = z.infer<typeof passSchema>;
export type NotificationFormData = z.infer<typeof notificationSchema>;
