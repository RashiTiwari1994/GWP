import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { cookies } from 'next/headers';
const inter = Inter({ subsets: ['latin'] });

// TODO: Update metadata when more info is available.
export const metadata: Metadata = {
  title: 'Wallet Pass',
  description: 'Google and Apple Wallet Pass',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const state = cookieStore.get('sidebar_expanded')?.value === 'true';
  return (
    <html lang="en">
      <body className={`${inter.className}  antialiased`}>
        <SidebarProvider>
          <Toaster />
          <AppSidebar sidebarExpanded={state} />
          <main className=" max-w-7xl mx-auto min-h-screen px-4 sm:px-6 md:px-8 pt-12 sm:py-4 w-full">
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
