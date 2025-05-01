
'use client'; // This page uses client components and hooks

import type React from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HostelRequestSystem from '@/components/student/hostel-requests';
import CanteenTokenSystem from '@/components/canteen/token-system';
import RegistrationDesk from '@/components/registration/registration-desk'; // Can be used by students too
import { Loader2, Home, Utensils, ClipboardCheck } from 'lucide-react';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user';

// Helper to show loading state
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading Section...</span>
  </div>
);

export default function StudentDashboardPage() {
  const currentUser = MOCK_CURRENT_USER; // Replace with actual auth

  // Check if the user is a student (or admin for testing)
   const isStudent = currentUser?.role === UserRole.Student || currentUser?.role === UserRole.SuperAdmin;

   if (!currentUser || !isStudent) {
      // Basic access control - ideally done via middleware
      return (
           <div className="container mx-auto py-12 px-4 text-center">
                <Card className="max-w-lg mx-auto p-8 border-destructive bg-destructive/10">
                    <CardHeader>
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                         <CardDescription>This section is for students only.</CardDescription>
                    </CardHeader>
                </Card>
           </div>
        );
    }

   return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Student Dashboard</h1>

       <Tabs defaultValue="registration" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="registration"><ClipboardCheck className="mr-2 h-4 w-4"/>Event Registration</TabsTrigger>
                <TabsTrigger value="hostel"><Home className="mr-2 h-4 w-4"/>Hostel Requests</TabsTrigger>
                <TabsTrigger value="canteen"><Utensils className="mr-2 h-4 w-4"/>Canteen Tokens</TabsTrigger>
                {/* Add more student tabs here */}
          </TabsList>

            <TabsContent value="registration">
                <Suspense fallback={<LoadingFallback />}>
                    <RegistrationDesk />
                 </Suspense>
            </TabsContent>

            <TabsContent value="hostel">
                <Suspense fallback={<LoadingFallback />}>
                  <HostelRequestSystem />
                </Suspense>
            </TabsContent>

            <TabsContent value="canteen">
                 <Suspense fallback={<LoadingFallback />}>
                  <CanteenTokenSystem />
                 </Suspense>
            </TabsContent>

          {/* Add more student tab contents here */}

       </Tabs>
    </main>
  );
}
