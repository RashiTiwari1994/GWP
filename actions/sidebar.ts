'use server';

import { cookies } from 'next/headers';

export async function setSidebarExpandedCookie(status: 'true' | 'false') {
  const cookieStore = await cookies();
  cookieStore.set('sidebar_expanded', status);
}
