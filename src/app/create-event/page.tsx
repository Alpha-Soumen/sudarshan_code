import CreateEventForm from '@/components/create-event-form';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  return (
     <main className="container mx-auto py-8 px-4">
       <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Create New Event</h1>
         <Button asChild variant="outline" size="sm">
           <Link href="/">
            {/* Wrap content in a span */}
            <span className="flex items-center">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </span>
           </Link>
         </Button>
       </div>
       <div className="max-w-3xl mx-auto"> {/* Center the form */}
         <CreateEventForm />
       </div>
      <Toaster />
    </main>
  );
}
