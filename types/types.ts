import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormData } from '@/lib/zod/pass-zod';
import { PassType } from '@prisma/client';

export interface StepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  control: Control<FormData>;
}

export interface TextField {
  title: string;
  displayText: string;
  url?: string | null;
}

export interface PassCustomization {
  logoUrl: string;
  coverImgUrl: string;
  websiteUrl: string | null;
  qrUrl: string | null;
  qrText: string | null;
  backgroundColor: string;
  notificationTitle: string | null;
  textFields?: Record<string, any> | null;
  linkModules?: Record<string, any> | null;
}

export interface PassData {
  id?: string;
  type: PassType;
  name: string;
  url: string | null;
  customization: PassCustomization[];
}

export type Notification = {
  id: string;
  passId: string;
  userId: string;
  message: string;
  sentAt: Date;
  createdAt: Date;
  pass: {
    name: string;
    type: string;
  };
};

export interface LoyaltyTokenPayload {
  iss: string;
  aud: string;
  origins: string[];
  typ: string;
  payload: {
    loyaltyObjects: Array<{
      id: string;
    }>;
  };
  iat: number;
}
