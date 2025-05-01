
'use client';

import CertificateGenerator from '@/components/certificate-generator';
import { MOCK_CURRENT_USER, UserRole } from '@/types/user'; // Use mock user
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function CertificatePage() {
  const currentUser = MOCK_CURRENT_USER; // Replace with actual auth context

  // Basic check if a user is logged in and is a student (or admin for testing)
  if (!currentUser || (currentUser.role !== UserRole.Student && currentUser.role !== UserRole.SuperAdmin)) {
      return (
          <div className="container mx-auto py-12 px-4 text-center">
             <Card className="max-w-lg mx-auto p-8 border-destructive bg-destructive/10">
                 <CardHeader className="items-center">
                      <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                      <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                      <CardDescription>You must be logged in as a student to generate certificates.</CardDescription>
                 </CardHeader>
             </Card>
          </div>
        );
  }

  return (
    <main className="container mx-auto py-8 px-4 flex justify-center">
      <CertificateGenerator userId={currentUser.id} />
    </main>
  );
}
