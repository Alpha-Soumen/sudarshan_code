

'use client'; // Need client hooks for theme and potentially user role check

// Removed type import for Metadata as it's now defined in head directly
// import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, UserCog, LayoutDashboard, Award } from 'lucide-react'; // Added Award icon
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { MOCK_CURRENT_USER, UserRole, hasPermission } from '@/types/user'; // Import user types and mock data


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    // Get mock user - replace with actual auth context hook in a real app
    const currentUser = MOCK_CURRENT_USER;

    const showAdminLink = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.EventManager, UserRole.FinanceAdmin]);
    const showStudentLink = hasPermission(currentUser, [UserRole.Student, UserRole.SuperAdmin]); // Admin can see student view too
    const showCertificateLink = hasPermission(currentUser, [UserRole.Student, UserRole.SuperAdmin]);


  return (
    // suppressHydrationWarning is recommended by next-themes
    <html lang="en" suppressHydrationWarning>
      <head>
           {/* Static metadata in head */}
           <title>EduEvent Hub</title>
           <meta name="description" content="Manage and register for educational events." />
           {/* Add other static head elements like favicons here if needed */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="bg-card border-b sticky top-0 z-50"> {/* Make header sticky */}
              <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-primary hover:opacity-90 transition-opacity">
                  EduEvent Hub
                </Link>
                <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end"> {/* Allow wrapping on small screens */}
                     {/* Show Admin Link */}
                     {showAdminLink && (
                         <Button asChild variant="ghost" size="sm">
                           <Link href="/admin">
                              <span className="flex items-center">
                                <UserCog className="mr-1 h-4 w-4" /> Admin
                              </span>
                           </Link>
                         </Button>
                     )}
                      {/* Show Student Link */}
                     {showStudentLink && (
                         <Button asChild variant="ghost" size="sm">
                           <Link href="/student">
                              <span className="flex items-center">
                                <LayoutDashboard className="mr-1 h-4 w-4" /> Student
                              </span>
                           </Link>
                         </Button>
                     )}
                      {/* Show Certificate Link */}
                       {showCertificateLink && (
                         <Button asChild variant="ghost" size="sm">
                           <Link href="/student/certificates"> {/* Corrected path */}
                              <span className="flex items-center">
                                <Award className="mr-1 h-4 w-4" /> Certificates
                              </span>
                           </Link>
                         </Button>
                     )}
                      {/* Create Event Button */}
                     {hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.EventManager]) && ( // Only show if allowed to create
                         <Button asChild variant="secondary" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300 mt-1 sm:mt-0">
                             <Link href="/create-event">
                               <span className="flex items-center">
                                 <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                               </span>
                             </Link>
                         </Button>
                      )}

                   <ThemeToggle /> {/* Add ThemeToggle here */}
                </div>
              </nav>
            </header>
            {/* Main content area */}
            <div className="flex-grow bg-background">
              {children}
            </div>
             {/* Footer */}
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
