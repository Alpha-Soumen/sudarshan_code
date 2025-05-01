'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { Event, Registration } from '@/types/event';
import { registerForEvent } from '@/lib/events';
import { CalendarDays, Users, MapPin, Mic, DollarSign, Building, Ticket, Loader2, Info, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event: initialEvent }: EventDetailsProps) {
  const [event, setEvent] = useState<Event>(initialEvent);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ success: boolean; message: string; token?: string } | null>(null);
  const { toast } = useToast();

  // Hydration safe state for remaining seats
  const [remainingSeats, setRemainingSeats] = useState<number | null>(null);
  const [isFull, setIsFull] = useState<boolean | null>(null);

  useEffect(() => {
    // Calculate remaining seats and isFull on client-side to avoid hydration mismatch
    const calculatedRemainingSeats = event.totalSeats - event.registeredSeats;
    setRemainingSeats(calculatedRemainingSeats);
    setIsFull(calculatedRemainingSeats <= 0);
  }, [event.totalSeats, event.registeredSeats]);


  const handleRegister = async () => {
    setIsRegistering(true);
    setRegistrationResult(null); // Clear previous result
    try {
      // Simulate getting a user ID (replace with actual user auth)
      const userId = `user_${Math.random().toString(36).substring(2, 9)}`;
      const result = await registerForEvent(event.id, userId);

      setRegistrationResult({
         success: result.success,
         message: result.message,
         token: result.registration?.token
      });

      if (result.success && result.registration) {
        toast({
          title: "Registration Successful!",
          description: `Your unique token: ${result.registration.token}`,
          variant: "default", // Use default (often white/light) for success
        });
        // Update event state locally to reflect new registration count
        setEvent(prevEvent => ({
           ...prevEvent,
           registeredSeats: prevEvent.registeredSeats + 1
        }));
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setRegistrationResult({ success: false, message });
      toast({
        title: "Registration Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  // Display loading state for seats until client-side calculation is done
  const seatDisplay = remainingSeats === null || isFull === null
    ? <Skeleton className="h-5 w-24 inline-block" />
    : isFull
      ? <Badge variant="destructive">Event Full</Badge>
      : `${remainingSeats} / ${event.totalSeats} seats available`;


  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">{event.name}</CardTitle>
        <CardDescription className="flex items-center text-md text-muted-foreground pt-2">
          <CalendarDays className="mr-2 h-5 w-5" />
          {formatDate(event.date)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
           <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md">
             <Users className="h-5 w-5 text-primary" />
             <span>{seatDisplay}</span>
           </div>
           <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md">
             <MapPin className="h-5 w-5 text-primary" />
             <span>{event.roomAssignment}</span>
           </div>
           <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md">
             <Mic className="h-5 w-5 text-primary" />
             <span>Speaker: {event.speaker}</span>
           </div>
           <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md">
             <DollarSign className="h-5 w-5 text-primary" />
             <span>Cost: {event.cost > 0 ? `$${event.cost.toFixed(2)}` : 'Free'}</span>
           </div>
           {event.sponsorship && (
             <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md md:col-span-2">
               <Building className="h-5 w-5 text-primary" />
               <span>Sponsored by: {event.sponsorship}</span>
             </div>
           )}
         </div>


        {registrationResult && (
           <Alert variant={registrationResult.success ? "default" : "destructive"} className={registrationResult.success ? 'border-green-500' : ''}>
             {registrationResult.success ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
             <AlertTitle>{registrationResult.success ? "Registration Confirmed" : "Registration Info"}</AlertTitle>
             <AlertDescription>
               {registrationResult.message}
               {registrationResult.success && registrationResult.token && (
                  <div className="mt-2 font-mono text-sm p-2 bg-muted rounded">
                    Your Token: {registrationResult.token}
                  </div>
               )}
             </AlertDescription>
           </Alert>
         )}

      </CardContent>
      <CardFooter>
         {remainingSeats !== null && !isFull && !registrationResult?.success && (
           <Button
             onClick={handleRegister}
             disabled={isRegistering || isFull === true} // Ensure isFull is checked against boolean true
             className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300"
             size="lg"
           >
             {isRegistering ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
               </>
             ) : (
               <>
                 <Ticket className="mr-2 h-4 w-4" /> Register for this Event
               </>
             )}
           </Button>
         )}
         {isFull === true && !registrationResult?.success && (
             <Button disabled className="w-full" size="lg">Event is Full</Button>
         )}
         {registrationResult?.success && (
            <Button disabled className="w-full bg-green-600" size="lg">
                <CheckCircle className="mr-2 h-4 w-4" /> Registered
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
