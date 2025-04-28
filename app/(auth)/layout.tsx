import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navbar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wallet Pass',
  description: 'Google and Apple Wallet Pass',
};
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl">{children}</div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
