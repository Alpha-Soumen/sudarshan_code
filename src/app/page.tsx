import EventList from '@/components/event-list';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Upcoming Events</h1>
      <EventList />
      <Toaster />
    </main>
  );
}
