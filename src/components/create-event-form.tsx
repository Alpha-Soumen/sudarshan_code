'use client';

import type React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createEvent } from '@/lib/events'; // Import the server action/function
import type { Event } from '@/types/event';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500),
  date: z.date({ required_error: 'Event date is required.' }),
  totalSeats: z.coerce.number().int().positive({ message: 'Total seats must be a positive number.' }),
  roomAssignment: z.string().min(1, { message: 'Room assignment is required.' }).max(50),
  speaker: z.string().min(2, { message: 'Speaker name must be at least 2 characters.' }).max(100),
  cost: z.coerce.number().min(0, { message: 'Cost cannot be negative.' }).default(0),
  sponsorship: z.string().max(100).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      date: undefined, // Initialize date as undefined
      totalSeats: 10,
      roomAssignment: '',
      speaker: '',
      cost: 0,
      sponsorship: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const eventData: Omit<Event, 'id' | 'registeredSeats'> = {
        ...values,
        date: values.date.toISOString(), // Convert Date object to ISO string
      };
      const newEvent = await createEvent(eventData);

      toast({
        title: "Event Created Successfully!",
        description: `Event "${newEvent.name}" has been added.`,
      });
      form.reset(); // Reset form after successful submission
      // Optionally redirect the user after creation
       router.push(`/events/${newEvent.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: "Error Creating Event",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
        {/* Event Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Annual Tech Conference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide details about the event..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date and Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                    initialFocus
                  />
                   {/* Basic Time Input - Replace with a dedicated time picker if needed */}
                   <div className="p-3 border-t border-border">
                     <label htmlFor="time-input" className="text-sm font-medium">Time (HH:MM)</label>
                     <Input
                        id="time-input"
                        type="time"
                        defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                           const time = e.target.value;
                           if (time && field.value) {
                              const [hours, minutes] = time.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                           } else if (time && !field.value) {
                              // Handle case where date is not set yet, maybe set a default date like today
                              const [hours, minutes] = time.split(':').map(Number);
                              const newDate = new Date();
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                           }
                        }}
                        className="mt-1"
                     />
                   </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Seats */}
        <FormField
          control={form.control}
          name="totalSeats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Seats</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Room Assignment */}
        <FormField
          control={form.control}
          name="roomAssignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Assignment</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Room 101 or Auditorium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Speaker */}
        <FormField
          control={form.control}
          name="speaker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speaker</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cost */}
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 25.00 (leave 0 for free)" {...field} />
              </FormControl>
               <FormDescription>
                 Enter 0 for free events.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sponsorship (Optional) */}
        <FormField
          control={form.control}
          name="sponsorship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sponsorship (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tech Corp Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-300">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Event...
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </form>
    </Form>
  );
}
