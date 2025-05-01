
'use client'; // This page uses client components and hooks

import type React from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VolunteerManagementPanel from '@/components/admin/volunteer-management';
import FinanceReportPanel from '@/components/admin/finance-report';
import HostelManagementPanel from '@/components/admin/hostel-management';
import CanteenAdminPanel from '@/components/admin/canteen-admin';
import { Loader2, Users, BarChart2, Home, Utensils } from 'lucide-react';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user'; // Assuming you have role definitions

// Helper to show loading state for dynamically loaded components
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading Section...</span>
  </div>
);

export default function AdminDashboardPage() {
  // Get current user (replace with actual authentication context)
  const currentUser = MOCK_CURRENT_USER;

  // Determine which tabs to show based on user role
  const showVolunteerManagement = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.EventManager]);
  const showFinance = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.FinanceAdmin]);
  const showHostelManagement = hasPermission(currentUser, [UserRole.SuperAdmin]); // Only SuperAdmin for now
  const showCanteenAdmin = hasPermission(currentUser, [UserRole.SuperAdmin]); // Only SuperAdmin for now

  // Determine default tab based on permissions
  const getDefaultTab = () => {
    if (showVolunteerManagement) return "volunteers";
    if (showFinance) return "finance";
    if (showHostelManagement) return "hostel";
    if (showCanteenAdmin) return "canteen";
    return ""; // Should not happen if admin page is protected
  };

  const defaultTab = getDefaultTab();

  if (!currentUser || !hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.EventManager, UserRole.FinanceAdmin])) {
      // Basic access control check - ideally done via middleware or layout
      return (
           <div className="container mx-auto py-12 px-4 text-center">
                <Card className="max-w-lg mx-auto p-8 border-destructive bg-destructive/10">
                    <CardHeader>
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                         <CardDescription>You do not have permission to view the admin dashboard.</CardDescription>
                    </CardHeader>
                </Card>
           </div>
        );
    }


  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Admin Dashboard</h1>

       <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
             {showVolunteerManagement && (
                <TabsTrigger value="volunteers"><Users className="mr-2 h-4 w-4"/>Volunteers</TabsTrigger>
             )}
             {showFinance && (
                <TabsTrigger value="finance"><BarChart2 className="mr-2 h-4 w-4"/>Finance</TabsTrigger>
             )}
              {showHostelManagement && (
                 <TabsTrigger value="hostel"><Home className="mr-2 h-4 w-4"/>Hostel</TabsTrigger>
              )}
              {showCanteenAdmin && (
                 <TabsTrigger value="canteen"><Utensils className="mr-2 h-4 w-4"/>Canteen</TabsTrigger>
              )}
              {/* Add more admin tabs here */}
          </TabsList>

           {showVolunteerManagement && (
             <TabsContent value="volunteers">
                <Suspense fallback={<LoadingFallback />}>
                  <VolunteerManagementPanel />
                </Suspense>
             </TabsContent>
           )}

           {showFinance && (
             <TabsContent value="finance">
                <Suspense fallback={<LoadingFallback />}>
                  <FinanceReportPanel />
                 </Suspense>
             </TabsContent>
           )}

            {showHostelManagement && (
             <TabsContent value="hostel">
                <Suspense fallback={<LoadingFallback />}>
                  <HostelManagementPanel />
                 </Suspense>
             </TabsContent>
            )}

             {showCanteenAdmin && (
             <TabsContent value="canteen">
                <Suspense fallback={<LoadingFallback />}>
                  <CanteenAdminPanel />
                 </Suspense>
             </TabsContent>
            )}

          {/* Add more admin tab contents here */}

       </Tabs>
    </main>
  );
}
