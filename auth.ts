import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/utils/email';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    // BUG: Prob a bug with updateAge method. It throws an error - Argument `where` of type SessionWhereUniqueInput needs at least one of `id` arguments.
    // As a workaround, set updateAge to a large value for now.
    updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  plugins: [
    admin({
      impersonationSessionDuration: 60 * 60 * 24 * 7, // 7 days
    }),
  ], // api/auth/reference
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log('Url to reset the password: ', url);
      if (process.env.NODE_ENV === 'production') {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      console.log('Url to verify email: ', verificationUrl);
      if (process.env.NODE_ENV === 'production') {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          text: `Click the link to verify your email: ${verificationUrl}`,
        });
      }
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
