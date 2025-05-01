'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Event } from '@/types/event';
import { getEvents } from '@/lib/events';
import { CalendarDays, Users, MapPin, Mic, DollarSign, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (isLoading) {
    return <EventListSkeleton />;
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  if (events.length === 0) {
    return <p className="text-muted-foreground text-center">No events found.</p>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const remainingSeats = event.totalSeats - event.registeredSeats;
        const isFull = remainingSeats <= 0;

        return (
          <Card key={event.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">{event.name}</CardTitle>
              <CardDescription className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarDays className="mr-2 h-4 w-4" />
                {formatDate(event.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm mb-4 line-clamp-3">{event.description}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    {remainingSeats > 0 ? `${remainingSeats} / ${event.totalSeats} seats available` : 'Event Full'}
                  </span>
                  {isFull && <Badge variant="destructive" className="ml-2">Full</Badge>}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.roomAssignment}</span>
                </div>
                 <div className="flex items-center">
                   <Mic className="mr-2 h-4 w-4" />
                   <span>Speaker: {event.speaker}</span>
                 </div>
                 <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Cost: {event.cost > 0 ? `$${event.cost.toFixed(2)}` : 'Free'}</span>
                  </div>
                 {event.sponsorship && (
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Sponsored by: {event.sponsorship}</span>
                    </div>
                  )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full transition-colors duration-300">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// Skeleton Loading Component
function EventListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="flex flex-col justify-between">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-3/6" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
