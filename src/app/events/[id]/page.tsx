import EventDetails from '@/components/event-details';
import { getEventById } from '@/lib/events';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventById(params.id);

  if (!event) {
    return (
       <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you are looking for does not exist or may have been removed.</p>
        <Button asChild variant="outline">
          <Link href="/">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
     <div className="container mx-auto py-8 px-4">
       <Button asChild variant="outline" className="mb-6">
         <Link href="/">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
         </Link>
       </Button>
       <EventDetails event={event} />
       <Toaster />
     </div>
  );
}

// Optional: Generate static paths if you know all event IDs beforehand
// export async function generateStaticParams() {
//   const events = await getEvents();
//   return events.map((event) => ({
//     id: event.id,
//   }));
// }
