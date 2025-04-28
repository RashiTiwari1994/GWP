import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to create a pass.', passes: null },
        { status: 401 }
      );
    }

    const passes = await prisma.walletPass.findMany({
      where: {
        userId: session?.user.id,
      },
      include: {
        customization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ passes }, { status: 200 });
  } catch (error) {
    console.error('Error Fetching passes', error);
    return NextResponse.json(
      {
        error: 'Error fetching passes',
        details: error instanceof Error ? error.message : 'Unknown error',
        passes: null,
      },
      { status: 500 }
    );
  }
}
