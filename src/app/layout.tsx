import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EduEvent Hub',
  description: 'Manage and register for educational events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <header className="bg-primary text-primary-foreground shadow-md">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
              EduEvent Hub
            </Link>
            <Button asChild variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300">
              <Link href="/create-event">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Event
              </Link>
            </Button>
          </nav>
        </header>
        <Separator />
        <div className="flex-grow">
          {children}
        </div>
         <footer className="bg-muted text-muted-foreground py-4 mt-8">
            <div className="container mx-auto text-center text-sm">
              © {new Date().getFullYear()} EduEvent Hub. All rights reserved.
            </div>
         </footer>
      </body>
    </html>
  );
}
