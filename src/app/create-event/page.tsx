import CreateEventForm from '@/components/create-event-form';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-2xl">
       <Button asChild variant="outline" className="mb-6">
         <Link href="/">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
         </Link>
       </Button>
      <h1 className="text-3xl font-bold mb-6 text-primary">Create New Event</h1>
      <CreateEventForm />
      <Toaster />
    </main>
  );
}
