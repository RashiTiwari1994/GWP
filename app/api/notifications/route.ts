import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { LoyaltyTokenPayload } from '@/types/types';

async function getGoogleWalletToken() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || !process.env.GOOGLE_WALLET_ISSUER_ID) {
    throw new Error('Server configuration error. Missing required environment variables.');
  }

  let credentials;
  try {
    credentials = JSON.parse(
      fs.readFileSync(path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY), 'utf-8')
    );
  } catch (error) {
    console.error('Error reading service account credentials:', error);
    throw new Error('Failed to load Google service account credentials');
  }

  const token = jwt.sign(
    {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: 'https://oauth2.googleapis.com/token',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    },
    credentials.private_key,
    { algorithm: 'RS256' }
  );

  try {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to authenticate with Google Wallet API');
  }
}

function extractObjectIdFromUrl(url: string): string {
  try {
    // The URL format is: https://pay.google.com/gp/v/save/{JWT}
    const jwtToken = url.split('/').pop();
    if (!jwtToken) throw new Error('Invalid URL format');

    const decoded = jwt.decode(jwtToken) as LoyaltyTokenPayload;
    if (!decoded?.payload?.loyaltyObjects?.[0]?.id) {
      throw new Error('Invalid JWT payload format');
    }
    return decoded.payload.loyaltyObjects[0].id;
  } catch (error) {
    console.error('Error extracting object ID:', error);
    throw new Error('Failed to extract Google Wallet object ID');
  }
}

async function sendNotification(walletObjectId: string, message: string) {
  const accessToken = await getGoogleWalletToken();
  try {
    const response = await axios.patch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${walletObjectId}`,
      {
        messages: [
          {
            header: 'New Notification',
            body: message,
            messageType: 'TEXT_AND_NOTIFY',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error sending notification:',
      error instanceof Error ? error.message : 'Failed to send notification to Google Wallet'
    );
    throw new Error('Failed to send notification to Google Wallet');
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passType, message } = await req.json();

    // Get the pass to verify ownership and get the URL
    const pass = await prisma.walletPass.findUnique({
      where: {
        id: passType,
        userId: session.user.id,
      },
    });

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found or you do not have permission to send notifications to it' },
        { status: 404 }
      );
    }

    if (!pass.url) {
      return NextResponse.json({ error: 'Pass URL not found' }, { status: 400 });
    }

    // Extract the Google Wallet object ID from the pass URL
    const walletObjectId = extractObjectIdFromUrl(pass.url);
    const result = await sendNotification(walletObjectId, message);

    // Store notification history
    await prisma.notificationHistory.create({
      data: {
        passId: passType,
        message: message,
        userId: session.user.id,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process notification' },
      { status: 500 }
    );
  }
}
