// Do NOT REMOVE THIS CODE.

// 'use server';

// import { auth } from '@/auth';
// import prisma from '@/lib/prisma';
// import { passSchema } from '@/lib/zod/pass-notification-zod';
// import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers';
// import fs from 'fs';
// import path from 'path';
// import jwt from 'jsonwebtoken';
// import axios from 'axios';
// import { LoyaltyTokenPayload, PassData } from '@/types/types';

// // Define a custom interface for the decoded token

// async function getGoogleWalletToken() {
//     // Check if required environment variables are set
//     if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || !process.env.GOOGLE_WALLET_ISSUER_ID) {
//         throw new Error('Server configuration error. Missing required environment variables.');
//     }

//     // Load the service account credentials from a file
//     let credentials;
//     try {
//         credentials = JSON.parse(
//             fs.readFileSync(
//                 path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
//                 'utf-8'
//             )
//         );
//     } catch (error) {
//         console.error('Error reading service account credentials:', error);
//         throw new Error('Failed to load Google service account credentials');
//     }

//     // Generate a JWT token for authentication
//     const token = jwt.sign(
//         {
//             iss: credentials.client_email,
//             scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
//             aud: 'https://oauth2.googleapis.com/token',
//             exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
//             iat: Math.floor(Date.now() / 1000),
//         },
//         credentials.private_key,
//         { algorithm: 'RS256' }
//     );

//     // Get an access token
//     try {
//         const tokenResponse = await axios.post('https://oauth2.googleapis.com/token',
//             `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
//             {
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//             }
//         );
//         return {
//             accessToken: tokenResponse.data.access_token,
//             credentials
//         };
//     } catch (error) {
//         console.error('Error getting access token:', error);
//         throw new Error('Failed to authenticate with Google Wallet API');
//     }
// }

// async function createGoogleWalletPass(data: PassData) {
//     const { accessToken, credentials } = await getGoogleWalletToken();
//     const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
//     const uniqueSuffix = Date.now();
//     const { name, customization = [] } = data;
//     const { logoUrl, backgroundColor, coverImgUrl, notificationTitle, websiteUrl, qrText, textFields, linkModules } = customization[0] || {};

//     const classId = `${issuerId}.loyalty-${uniqueSuffix}`;
//     const objectId = `${issuerId}.loyalty-${uniqueSuffix}-object`;

//     // Create the loyalty class
//     const classData = {
//         id: classId,
//         issuerName: notificationTitle || name,
//         programName: name,
//         programLogo: {
//             sourceUri: {
//                 uri: logoUrl,
//             },
//             contentDescription: {
//                 defaultValue: {
//                     language: 'en-US',
//                     value: 'Loyalty program logo',
//                 },
//             },
//         },
//         hexBackgroundColor: backgroundColor,
//         reviewStatus: 'UNDER_REVIEW',
//     };

//     try {
//         await axios.post('https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass', classData, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.error('Error creating loyalty class:', error instanceof Error ? error.message : 'Unknown error');
//         throw new Error('Failed to create loyalty class in Google Wallet');
//     }

//     // Create the loyalty object
//     const objectData = {
//         id: objectId,
//         classId,
//         state: 'ACTIVE',
//         heroImage: {
//             sourceUri: {
//                 uri: coverImgUrl
//             },
//             contentDescription: {
//                 defaultValue: {
//                     language: 'en-US',
//                     value: 'Hero image description'
//                 }
//             }
//         },
//         textModulesData: textFields?.map((field: { title: string; displayText: string; url?: string | null }) => ({
//             header: field.title,
//             body: field.url ? `<a href='${field.url}'>${field.displayText}</a>` : field.displayText,
//             id: `text_module_${Date.now()}_${Math.random().toString(36).substring(7)}`
//         })) || [],

//         linksModuleData: {
//             uris: linkModules?.map((link: { title: string; url: string; description?: string }) => ({
//                 uri: link.url,
//                 description: link.title,

//             })) || []
//         },

//         ...(websiteUrl ? {
//             barcode: {
//                 type: 'QR_CODE',
//                 value: websiteUrl,
//                 alternateText: qrText || 'Visit our website'
//             }
//         } : {})
//     };

//     try {
//         await axios.post('https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject', objectData, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.error('Error creating loyalty object:', error instanceof Error ? error.message : "Unknown error");
//         throw new Error('Failed to create loyalty object in Google Wallet');
//     }

//     const loyaltyPayload = {
//         iss: credentials.client_email,
//         aud: 'google',
//         origins: ['https://yourdomain.com'],
//         typ: 'savetowallet',
//         payload: {
//             loyaltyObjects: [{ id: objectId }],
//         },
//     };

//     const loyaltyToken = jwt.sign(loyaltyPayload, credentials.private_key, {
//         algorithm: 'RS256',
//     });

//     return `https://pay.google.com/gp/v/save/${loyaltyToken}`;
// }

// async function updateGoogleWalletPass(existingPass: PassData, data: Partial<PassData>) {
//     const { accessToken, credentials } = await getGoogleWalletToken();

//     // Extract the objectId from the existing URL
//     if (!existingPass.url) {
//         throw new Error('Pass URL is missing');
//     }
//     const urlParts = existingPass.url.split('/');
//     const loyaltyToken = urlParts[urlParts.length - 1];

//     // Decode the JWT token to get the objectId
//     const decodedToken = jwt.decode(loyaltyToken) as LoyaltyTokenPayload;
//     if (!decodedToken || !decodedToken.payload || !decodedToken.payload.loyaltyObjects || !decodedToken.payload.loyaltyObjects[0]) {
//         throw new Error('Invalid loyalty token format');
//     }

//     const objectId = decodedToken.payload.loyaltyObjects[0].id;
//     const classId = objectId.replace('-object', '');

//     // Prepare updated data
//     const { name, customization = [] } = data;
//     const { logoUrl, backgroundColor, coverImgUrl, notificationTitle, websiteUrl, qrText, textFields, linkModules } = customization[0] || {};

//     // Update the loyalty class if needed
//     if (name || logoUrl || backgroundColor || notificationTitle) {
//         const classData = {
//             id: classId,
//             issuerName: notificationTitle || existingPass.customization[0].notificationTitle || existingPass.name,
//             programName: name || existingPass.name,
//             programLogo: {
//                 sourceUri: {
//                     uri: logoUrl || existingPass.customization[0].logoUrl,
//                 },
//                 contentDescription: {
//                     defaultValue: {
//                         language: 'en-US',
//                         value: 'Loyalty program logo',
//                     },
//                 },
//             },
//             hexBackgroundColor: backgroundColor || existingPass.customization[0].backgroundColor,
//             reviewStatus: 'UNDER_REVIEW',
//         };

//         try {
//             await axios.put(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`, classData, {
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
//         } catch (error) {
//             console.error('Error updating loyalty class:', error instanceof Error ? error.message : 'Unknown error');
//             throw new Error('Failed to update loyalty class in Google Wallet');
//         }
//     }

//     // Update the loyalty object
//     const objectData = {
//         id: objectId,
//         classId,
//         state: 'ACTIVE',
//         heroImage: {
//             sourceUri: {
//                 uri: coverImgUrl || existingPass.customization[0].coverImgUrl
//             },
//             contentDescription: {
//                 defaultValue: {
//                     language: 'en-US',
//                     value: 'Hero image description'
//                 }
//             }
//         },
//         textModulesData: textFields?.map((field: { title: string; displayText: string; url?: string | null }) => ({
//             header: field.title,
//             body: field.url ? `<a href='${field.url}'>${field.displayText}</a>` : field.displayText,
//             id: `text_module_${Date.now()}_${Math.random().toString(36).substring(7)}`
//         })) || [],

//         linksModuleData: {
//             uris: linkModules?.map((link: { title: string; url: string; description?: string }) => ({
//                 uri: link.url,
//                 description: link.title,
//             })) || []
//         },

//         ...(websiteUrl || existingPass.customization[0].websiteUrl ? {
//             barcode: {
//                 type: 'QR_CODE',
//                 value: websiteUrl || existingPass.customization[0].websiteUrl,
//                 alternateText: qrText || existingPass.customization[0].qrText || 'Visit our website'
//             }
//         } : {})
//     };

//     try {
//         await axios.put(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`, objectData, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.error('Error updating loyalty object:', error instanceof Error ? error.message : "Unknown error");
//         throw new Error('Failed to update loyalty object in Google Wallet');
//     }

//     // Generate a new save URL
//     const loyaltyPayload = {
//         iss: credentials.client_email,
//         aud: 'google',
//         origins: ['https://yourdomain.com'],
//         typ: 'savetowallet',
//         payload: {
//             loyaltyObjects: [{ id: objectId }],
//         },
//     };

//     const newLoyaltyToken = jwt.sign(loyaltyPayload, credentials.private_key, {
//         algorithm: 'RS256',
//     });

//     return `https://pay.google.com/gp/v/save/${newLoyaltyToken}`;
// }

// export async function createPass(data: PassData) {
//     try {
//         const session = await auth.api.getSession({ headers: await headers() });
//         if (!session?.user) {
//             return { success: false, error: 'Unauthorized. Please sign in to create a pass.' };
//         }

//         const flattenedData = {
//             name: data.name,
//             type: data.type,
//             customization: data.customization[0]
//         };
//         const validationResult = passSchema.safeParse(flattenedData);
//         if (!validationResult.success) {
//             return {
//                 success: false,
//                 error: 'Invalid data',
//                 details: validationResult.error.format()
//             };
//         }

//         // Create Google Wallet pass and get the save URL
//         const saveUrl = await createGoogleWalletPass(data);

//         const { name, customization = [] } = data;
//         const { logoUrl, backgroundColor, coverImgUrl, notificationTitle, websiteUrl, qrText, textFields, linkModules } = customization[0] || {};

//         // Create the pass in the database
//         const walletPass = await prisma.walletPass.create({
//             data: {
//                 type: 'loyaltyCard',
//                 userId: session.user.id,
//                 name: name,
//                 url: saveUrl,
//                 customization: {
//                     create: {
//                         logoUrl: logoUrl,
//                         coverImgUrl: coverImgUrl,
//                         websiteUrl: websiteUrl || null,
//                         qrUrl: websiteUrl || null,
//                         qrText: qrText || null,
//                         backgroundColor: backgroundColor,
//                         textColor: '#FFFFFF', // Default text color
//                         notificationTitle: notificationTitle || null,
//                         textFields: textFields ? JSON.parse(JSON.stringify(textFields)) : null,
//                         linkModules: linkModules ? JSON.parse(JSON.stringify(linkModules)) : null
//                     }
//                 }
//             },
//             include: {
//                 customization: true
//             }
//         });

//         revalidatePath('/passes');
//         return { success: true, pass: walletPass, url: saveUrl };
//     } catch (error) {
//         console.error('Error creating pass:', error);
//         return {
//             success: false,
//             error: 'Failed to create pass',
//             details: error instanceof Error ? error.message : 'Unknown error'
//         };
//     }
// }

// export async function updatePass(id: string, data: PassData) {
//     try {
//         const session = await auth.api.getSession({ headers: await headers() });
//         if (!session) {
//             return { success: false, error: 'Unauthorized. Please sign in to update a pass.' };
//         }
//         const flattenedData = {
//             name: data.name,
//             type: data.type,
//             customization: data?.customization?.[0]
//         };

//         const validationResult = passSchema.partial().safeParse(flattenedData);
//         if (!validationResult.success) {
//             return {
//                 success: false,
//                 error: 'Invalid data',
//                 details: validationResult.error.format()
//             };
//         }

//         // Check if the pass exists and belongs to the user
//         const existingPass = await prisma.walletPass.findUnique({
//             where: {
//                 id: id,
//                 userId: session.user.id
//             },
//             include: {
//                 customization: true
//             }
//         });

//         if (!existingPass) {
//             return {
//                 success: false,
//                 error: 'Pass not found or you do not have permission to update it'
//             };
//         }

//         // Transform database pass to match PassData type
//         const passData: PassData = {
//             type: existingPass.type,
//             name: existingPass.name,
//             url: existingPass.url,
//             customization: [{
//                 logoUrl: existingPass.customization[0].logoUrl,
//                 coverImgUrl: existingPass.customization[0].coverImgUrl,
//                 websiteUrl: existingPass.customization[0].websiteUrl,
//                 qrUrl: existingPass.customization[0].qrUrl,
//                 qrText: existingPass.customization[0].qrText,
//                 backgroundColor: existingPass.customization[0].backgroundColor,
//                 notificationTitle: existingPass.customization[0].notificationTitle,
//                 textFields: typeof existingPass.customization[0].textFields === 'string'
//                     ? JSON.parse(existingPass.customization[0].textFields)
//                     : existingPass.customization[0].textFields,
//                 linkModules: typeof existingPass.customization[0].linkModules === 'string'
//                     ? JSON.parse(existingPass.customization[0].linkModules)
//                     : existingPass.customization[0].linkModules
//             }]
//         };

//         // Update the Google Wallet pass and get a new save URL
//         const newSaveUrl = await updateGoogleWalletPass(passData, data);

//         // Update the pass in the database
//         const updatedPass = await prisma.walletPass.update({
//             where: {
//                 id: id
//             },
//             data: {
//                 name: data.name || existingPass.name,
//                 type: data.type || existingPass.type,
//                 url: newSaveUrl,
//                 customization: {
//                     update: {
//                         where: {
//                             id: existingPass.customization[0].id
//                         },
//                         data: {
//                             logoUrl: data.customization[0]?.logoUrl || existingPass.customization[0].logoUrl,
//                             coverImgUrl: data.customization[0]?.coverImgUrl || existingPass.customization[0].coverImgUrl,
//                             websiteUrl: data.customization[0]?.websiteUrl || existingPass.customization[0].websiteUrl,
//                             qrUrl: data.customization[0]?.qrUrl || existingPass.customization[0].qrUrl,
//                             qrText: data.customization[0]?.qrText || existingPass.customization[0].qrText,
//                             backgroundColor: data.customization[0]?.backgroundColor || existingPass.customization[0].backgroundColor,
//                             notificationTitle: data.customization[0]?.notificationTitle || existingPass.customization[0].notificationTitle,
//                             textFields: data.customization[0]?.textFields ? JSON.parse(JSON.stringify(data.customization[0].textFields)) : existingPass.customization[0].textFields,
//                             linkModules: data.customization[0]?.linkModules ? JSON.parse(JSON.stringify(data.customization[0].linkModules)) : existingPass.customization[0].linkModules
//                         }
//                     }
//                 }
//             },
//             include: {
//                 customization: true
//             }
//         });

//         revalidatePath('/passes');
//         revalidatePath(`/passes/${id}`);
//         return { success: true, pass: updatedPass, url: newSaveUrl };
//     } catch (error) {
//         console.error('Error updating pass:', error);
//         return {
//             success: false,
//             error: 'Failed to update pass',
//             details: error instanceof Error ? error.message : 'Unknown error'
//         };
//     }
// }

// export async function getPass(id: string) {
//     try {
//         const session = await auth.api.getSession({ headers: await headers() });
//         if (!session?.user) {
//             return { success: false, error: 'Unauthorized. Please sign in to view this pass.' };
//         }

//         const pass = await prisma.walletPass.findUnique({
//             where: {
//                 id: id,
//                 userId: session.user.id
//             },
//             include: {
//                 customization: true
//             }
//         });

//         if (!pass) {
//             return {
//                 success: false,
//                 error: 'Pass not found or you do not have permission to view it'
//             };
//         }

//         return { success: true, pass };
//     } catch (error) {
//         console.error('Error fetching pass:', error);
//         return {
//             success: false,
//             error: 'Failed to fetch pass',
//             details: error instanceof Error ? error.message : 'Unknown error'
//         };
//     }
// }

'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { passSchema } from '@/lib/zod/pass-zod';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { LoyaltyTokenPayload, PassData } from '@/types/types';
import { google } from 'googleapis';

async function getGoogleWalletToken() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || !process.env.GOOGLE_WALLET_ISSUER_ID) {
    throw new Error('Server configuration error. Missing required environment variables.');
  }

  try {
    const credentials = JSON.parse(
      fs.readFileSync(path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY), 'utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    return {
      accessToken: accessToken.token,
      credentials,
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to authenticate with Google Wallet API');
  }
}

async function createGoogleWalletPass(data: PassData) {
  const { credentials } = await getGoogleWalletToken();
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const uniqueSuffix = Date.now();
  const { name, customization = [] } = data;
  const {
    logoUrl,
    backgroundColor,
    coverImgUrl,
    notificationTitle,
    websiteUrl,
    qrText,
    textFields,
    linkModules,
  } = customization[0] || {};

  const classId = `${issuerId}.loyalty-${uniqueSuffix}`;
  const objectId = `${issuerId}.loyalty-${uniqueSuffix}-object`;

  // Initialize Google Wallet API
  const walletAPI = google.walletobjects({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    }),
  });

  // Create the loyalty class
  const classData = {
    id: classId,
    issuerName: notificationTitle || name,
    programName: name,
    programLogo: {
      sourceUri: {
        uri: logoUrl,
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Loyalty program logo',
        },
      },
    },
    hexBackgroundColor: backgroundColor,
    reviewStatus: 'UNDER_REVIEW',
  };

  try {
    // Create loyalty class using Google API client
    await walletAPI.loyaltyclass.insert({
      requestBody: classData,
    });

    // Create loyalty object
    const objectData = {
      id: objectId,
      classId,
      state: 'ACTIVE',
      heroImage: {
        sourceUri: {
          uri: coverImgUrl,
        },
        contentDescription: {
          defaultValue: {
            language: 'en-US',
            value: 'Hero image description',
          },
        },
      },
      textModulesData:
        textFields?.map((field: { title: string; displayText: string; url?: string | null }) => ({
          header: field.title,
          body: field.url ? `<a href='${field.url}'>${field.displayText}</a>` : field.displayText,
          id: `text_module_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        })) || [],
      linksModuleData: {
        uris:
          linkModules?.map((link: { title: string; url: string; description?: string }) => ({
            uri: link.url,
            description: link.title,
          })) || [],
      },
      ...(websiteUrl
        ? {
            barcode: {
              type: 'QR_CODE',
              value: websiteUrl,
              alternateText: qrText || 'Visit our website',
            },
          }
        : {}),
    };

    await walletAPI.loyaltyobject.insert({
      requestBody: objectData,
    });

    const loyaltyPayload = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://yourdomain.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [{ id: objectId }],
      },
    };

    const loyaltyToken = jwt.sign(loyaltyPayload, credentials.private_key, {
      algorithm: 'RS256',
    });

    return `https://pay.google.com/gp/v/save/${loyaltyToken}`;
  } catch (error) {
    console.error(
      'Error creating loyalty pass:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw new Error('Failed to create loyalty pass in Google Wallet');
  }
}

async function updateGoogleWalletPass(existingPass: PassData, data: Partial<PassData>) {
  const { accessToken, credentials } = await getGoogleWalletToken();

  // Extract the objectId from the existing URL
  if (!existingPass.url) {
    throw new Error('Pass URL is missing');
  }
  const urlParts = existingPass.url.split('/');
  const loyaltyToken = urlParts[urlParts.length - 1];

  // Decode the JWT token to get the objectId
  const decodedToken = jwt.decode(loyaltyToken) as LoyaltyTokenPayload;
  if (
    !decodedToken ||
    !decodedToken.payload ||
    !decodedToken.payload.loyaltyObjects ||
    !decodedToken.payload.loyaltyObjects[0]
  ) {
    throw new Error('Invalid loyalty token format');
  }

  const objectId = decodedToken.payload.loyaltyObjects[0].id;
  const classId = objectId.replace('-object', '');

  // Initialize Google Wallet API
  const walletAPI = google.walletobjects({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    }),
  });

  // Prepare updated data
  const { name, customization = [] } = data;
  const {
    logoUrl,
    backgroundColor,
    coverImgUrl,
    notificationTitle,
    websiteUrl,
    qrText,
    textFields,
    linkModules,
  } = customization[0] || {};
  // Update the loyalty class if needed
  if (name || logoUrl || backgroundColor || notificationTitle) {
    const classData = {
      id: classId,
      issuerName:
        notificationTitle || existingPass.customization[0].notificationTitle || existingPass.name,
      programName: name || existingPass.name,
      programLogo: {
        sourceUri: {
          uri: logoUrl || existingPass.customization[0].logoUrl,
        },
        contentDescription: {
          defaultValue: {
            language: 'en-US',
            value: 'Loyalty program logo',
          },
        },
      },
      hexBackgroundColor: backgroundColor || existingPass.customization[0].backgroundColor,
      reviewStatus: 'UNDER_REVIEW',
    };

    try {
      await walletAPI.loyaltyclass.update({
        resourceId: classId,
        requestBody: classData,
      });
    } catch (error) {
      console.error(
        'Error updating loyalty class:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error('Failed to update loyalty class in Google Wallet');
    }
  }

  // Update the loyalty object
  const objectData = {
    id: objectId,
    classId,
    state: 'ACTIVE',
    heroImage: {
      sourceUri: {
        uri: coverImgUrl || existingPass.customization[0].coverImgUrl,
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Hero image description',
        },
      },
    },
    textModulesData:
      textFields?.map((field: { title: string; displayText: string; url?: string | null }) => ({
        header: field.title,
        body: field.url ? `<a href='${field.url}'>${field.displayText}</a>` : field.displayText,
        id: `text_module_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      })) || [],
    linksModuleData: {
      uris:
        linkModules?.map((link: { title: string; url: string; description?: string }) => ({
          uri: link.url,
          description: link.title,
        })) || [],
    },
    ...(websiteUrl || existingPass.customization[0].websiteUrl
      ? {
          barcode: {
            type: 'QR_CODE',
            value: websiteUrl || existingPass.customization[0].websiteUrl,
            alternateText: qrText || existingPass.customization[0].qrText || 'Visit our website',
          },
        }
      : {}),
  };

  try {
    await walletAPI.loyaltyobject.update({
      resourceId: objectId,
      requestBody: objectData,
    });

    // Generate a new save URL
    const loyaltyPayload = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://yourdomain.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [{ id: objectId }],
      },
    };

    const newLoyaltyToken = jwt.sign(loyaltyPayload, credentials.private_key, {
      algorithm: 'RS256',
    });

    return `https://pay.google.com/gp/v/save/${newLoyaltyToken}`;
  } catch (error) {
    console.error(
      'Error updating loyalty object:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw new Error('Failed to update loyalty object in Google Wallet');
  }
}

export async function createPass(data: PassData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized. Please sign in to create a pass.' };
    }

    const flattenedData = {
      name: data.name,
      type: data.type,
      customization: data.customization[0],
    };
    const validationResult = passSchema.safeParse(flattenedData);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid data',
        details: validationResult.error.format(),
      };
    }

    // Create Google Wallet pass and get the save URL
    const saveUrl = await createGoogleWalletPass(data);

    const { name, customization = [] } = data;
    const {
      logoUrl,
      backgroundColor,
      coverImgUrl,
      notificationTitle,
      websiteUrl,
      qrText,
      textFields,
      linkModules,
    } = customization[0] || {};

    // Create the pass in the database
    const walletPass = await prisma.walletPass.create({
      data: {
        type: 'loyaltyCard',
        userId: session.user.id,
        name: name,
        url: saveUrl,
        customization: {
          create: {
            logoUrl: logoUrl,
            coverImgUrl: coverImgUrl,
            websiteUrl: websiteUrl || null,
            qrUrl: websiteUrl || null,
            qrText: qrText || null,
            backgroundColor: backgroundColor,
            textColor: '#FFFFFF', // Default text color
            notificationTitle: notificationTitle || null,
            textFields: textFields ? JSON.parse(JSON.stringify(textFields)) : null,
            linkModules: linkModules ? JSON.parse(JSON.stringify(linkModules)) : null,
          },
        },
      },
      include: {
        customization: true,
      },
    });

    revalidatePath('/passes');
    return { success: true, pass: walletPass, url: saveUrl };
  } catch (error) {
    console.error('Error creating pass:', error);
    return {
      success: false,
      error: 'Failed to create pass',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updatePass(id: string, data: PassData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Unauthorized. Please sign in to update a pass.' };
    }
    const flattenedData = {
      name: data.name,
      type: data.type,
      customization: data?.customization?.[0],
    };

    const validationResult = passSchema.partial().safeParse(flattenedData);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid data',
        details: validationResult.error.format(),
      };
    }

    // Check if the pass exists and belongs to the user
    const existingPass = await prisma.walletPass.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        customization: true,
      },
    });

    if (!existingPass) {
      return {
        success: false,
        error: 'Pass not found or you do not have permission to update it',
      };
    }

    // Transform database pass to match PassData type
    const passData: PassData = {
      type: existingPass.type,
      name: existingPass.name,
      url: existingPass.url,
      customization: [
        {
          logoUrl: existingPass.customization[0].logoUrl,
          coverImgUrl: existingPass.customization[0].coverImgUrl,
          websiteUrl: existingPass.customization[0].websiteUrl,
          qrUrl: existingPass.customization[0].qrUrl,
          qrText: existingPass.customization[0].qrText,
          backgroundColor: existingPass.customization[0].backgroundColor,
          notificationTitle: existingPass.customization[0].notificationTitle,
          textFields:
            typeof existingPass.customization[0].textFields === 'string'
              ? JSON.parse(existingPass.customization[0].textFields)
              : existingPass.customization[0].textFields,
          linkModules:
            typeof existingPass.customization[0].linkModules === 'string'
              ? JSON.parse(existingPass.customization[0].linkModules)
              : existingPass.customization[0].linkModules,
        },
      ],
    };

    // Update the Google Wallet pass and get a new save URL
    const newSaveUrl = await updateGoogleWalletPass(passData, data);

    // Update the pass in the database
    const updatedPass = await prisma.walletPass.update({
      where: {
        id: id,
      },
      data: {
        name: data.name || existingPass.name,
        type: data.type || existingPass.type,
        url: newSaveUrl,
        customization: {
          update: {
            where: {
              id: existingPass.customization[0].id,
            },
            data: {
              logoUrl: data.customization[0]?.logoUrl || existingPass.customization[0].logoUrl,
              coverImgUrl:
                data.customization[0]?.coverImgUrl || existingPass.customization[0].coverImgUrl,
              websiteUrl:
                data.customization[0]?.websiteUrl || existingPass.customization[0].websiteUrl,
              qrUrl: data.customization[0]?.qrUrl || existingPass.customization[0].qrUrl,
              qrText: data.customization[0]?.qrText || existingPass.customization[0].qrText,
              backgroundColor:
                data.customization[0]?.backgroundColor ||
                existingPass.customization[0].backgroundColor,
              notificationTitle:
                data.customization[0]?.notificationTitle ||
                existingPass.customization[0].notificationTitle,
              textFields: data.customization[0]?.textFields
                ? JSON.parse(JSON.stringify(data.customization[0].textFields))
                : existingPass.customization[0].textFields,
              linkModules: data.customization[0]?.linkModules
                ? JSON.parse(JSON.stringify(data.customization[0].linkModules))
                : existingPass.customization[0].linkModules,
            },
          },
        },
      },
      include: {
        customization: true,
      },
    });

    revalidatePath('/passes');
    revalidatePath(`/passes/${id}`);
    return { success: true, pass: updatedPass, url: newSaveUrl };
  } catch (error) {
    console.error('Error updating pass:', error);
    return {
      success: false,
      error: 'Failed to update pass',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getPass(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized. Please sign in to view this pass.' };
    }

    const pass = await prisma.walletPass.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        customization: true,
      },
    });

    if (!pass) {
      return {
        success: false,
        error: 'Pass not found or you do not have permission to view it',
      };
    }

    return { success: true, pass };
  } catch (error) {
    console.error('Error fetching pass:', error);
    return {
      success: false,
      error: 'Failed to fetch pass',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
