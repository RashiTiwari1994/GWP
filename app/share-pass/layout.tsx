import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} d-h-screen`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
