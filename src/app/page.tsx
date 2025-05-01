import EventList from '@/components/event-list';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import type React from 'react'; // Import React for Fragment shorthand

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 w-full overflow-hidden bg-primary/10">
        <Image
          src="https://picsum.photos/1600/400"
          alt="Educational Event Banner"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="event conference"
          priority // Load hero image faster
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-t from-background via-transparent to-transparent">
           <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary tracking-tight">
            Discover &amp; Join Events
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-6 max-w-2xl">
            Explore upcoming workshops, seminars, and conferences tailored for educational growth.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300 shadow-lg">
            <Link href="/create-event">
                {/* Wrap Link content in a span to ensure Button asChild gets a single element */}
                <span className="flex items-center">
                    <CalendarPlus className="mr-2 h-5 w-5" /> Host Your Event
                </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <main className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-primary text-center">Upcoming Events</h2>
        <EventList />
      </main>
      <Toaster />
    </>
  );
}
