import EventDetails from '@/components/event-details';
import { getEventById } from '@/lib/events';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react'; // Added AlertCircle


interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventById(params.id);

  if (!event) {
    return (
       <div className="container mx-auto py-12 px-4 text-center flex flex-col items-center"> {/* Centered content */}
         <AlertCircle className="w-16 h-16 text-destructive mb-4" /> {/* Larger Icon */}
        <h1 className="text-3xl font-bold text-destructive mb-3">Event Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
           The event you are looking for might have been moved, deleted, or never existed.
        </p>
        <Button asChild variant="default" size="lg"> {/* Changed variant and size */}
          <Link href="/">
             <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
     <div className="container mx-auto py-8 px-4">
       <div className="mb-6"> {/* Wrapper for back button */}
         <Button asChild variant="outline" size="sm">
           <Link href="/">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
           </Link>
         </Button>
       </div>
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
