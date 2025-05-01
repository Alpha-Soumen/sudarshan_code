import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle

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
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning is recommended by next-themes */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="bg-card border-b">
              <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-primary hover:opacity-90 transition-opacity">
                  EduEvent Hub
                </Link>
                <div className="flex items-center gap-4">
                   <Button asChild variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300">
                     <Link href="/create-event">
                       <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                     </Link>
                   </Button>
                   <ThemeToggle /> {/* Add ThemeToggle here */}
                </div>
              </nav>
            </header>
            {/* Remove Separator as border-b is added to header */}
            {/* <Separator /> */}
            <div className="flex-grow bg-background">
              {children}
            </div>
             <footer className="bg-muted text-muted-foreground py-4 mt-auto">
                <div className="container mx-auto text-center text-sm">
                  © {new Date().getFullYear()} EduEvent Hub. All rights reserved.
                </div>
             </footer>
         </ThemeProvider>
      </body>
    </html>
  );
}
