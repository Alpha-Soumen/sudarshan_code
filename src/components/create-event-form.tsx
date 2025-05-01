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
import { format, set } from 'date-fns';
import { CalendarIcon, Loader2, Clock } from 'lucide-react'; // Added Clock icon
import { useToast } from "@/hooks/use-toast";
import { createEvent } from '@/lib/events'; // Import the server action/function
import type { Event } from '@/types/event';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500),
  date: z.date({ required_error: 'Event date and time are required.' }),
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

    const handleTimeChange = (timeValue: string, currentFieldDate: Date | undefined) => {
    if (!timeValue) return; // Do nothing if time is empty

    const [hours, minutes] = timeValue.split(':').map(Number);
    let newDate: Date;

    if (currentFieldDate) {
      // If a date is already selected, update its time
      newDate = set(currentFieldDate, { hours, minutes, seconds: 0, milliseconds: 0 });
    } else {
      // If no date is selected, create a new Date object for today and set the time
      newDate = set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 });
    }

     // Ensure the selected date/time is not in the past
     if (newDate < new Date()) {
        // Optionally, show a toast or message indicating past time is invalid
        toast({
            title: "Invalid Time",
            description: "Please select a future time.",
            variant: "destructive",
        });
        // Reset the time input visually (though the form state might briefly hold the invalid value)
        // This requires managing the time input value separately if strict immediate validation is needed.
        // For simplicity, we'll let Zod handle the final validation on submit.
        form.setValue('date', newDate); // Still set it, rely on Zod/Calendar disable for user feedback
        return;
      }

    form.setValue('date', newDate);
  };


  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      // Ensure the date is not in the past right before submission
      if (values.date < new Date()) {
        toast({
          title: "Invalid Date/Time",
          description: "Cannot create an event in the past.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const eventData: Omit<Event, 'id' | 'registeredSeats'> = {
        ...values,
        date: values.date.toISOString(), // Convert Date object to ISO string
      };
      const newEvent = await createEvent(eventData);

      toast({
        title: "Event Created Successfully!",
        description: `Event "${newEvent.name}" has been added.`,
         className: "border-accent", // Style success toast
      });
      form.reset(); // Reset form after successful submission
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 md:p-8 rounded-lg shadow-lg border"> {/* Added border */}
        {/* Event Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Event Name</FormLabel> {/* Styling */}
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
              <FormLabel className="text-base font-semibold">Description</FormLabel> {/* Styling */}
              <FormControl>
                <Textarea placeholder="Provide details about the event..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date & Time */}
         <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-semibold">Date and Time</FormLabel> {/* Styling */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "flex-1 justify-start text-left font-normal", // flex-1 to take available width
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                       onSelect={(selectedDate) => {
                         if (!selectedDate) {
                           field.onChange(undefined);
                           return;
                         }
                         // Preserve time if date changes, otherwise use current time
                         const currentTime = field.value ?? new Date();
                         const newDate = set(selectedDate, {
                            hours: currentTime.getHours(),
                            minutes: currentTime.getMinutes(),
                            seconds: 0,
                            milliseconds: 0
                         });
                         // Only update if the new date is not in the past
                         if (newDate >= new Date(new Date().setHours(0,0,0,0))) {
                             field.onChange(newDate);
                         } else {
                              toast({ title: "Invalid Date", description: "Cannot select past dates.", variant: "destructive" });
                         }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates only
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Input */}
                <div className="relative flex-1"> {/* flex-1 to take available width */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="time"
                    aria-label="Event time"
                    value={field.value ? format(field.value, 'HH:mm') : ''}
                     onChange={(e) => handleTimeChange(e.target.value, field.value)}
                    className="pl-10" // Padding left for the icon
                    disabled={!field.value} // Optionally disable time until date is picked
                 />
                </div>
             </div>
              <FormMessage /> {/* Ensure message shows for the combined field */}
            </FormItem>
          )}
        />


        {/* Grid for numerical inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Seats */}
            <FormField
              control={form.control}
              name="totalSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Total Seats</FormLabel> {/* Styling */}
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
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
                  <FormLabel className="text-base font-semibold">Cost ($)</FormLabel> {/* Styling */}
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} />
                  </FormControl>
                   <FormDescription>
                     Enter 0 for free events.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


         {/* Grid for text inputs */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Assignment */}
            <FormField
              control={form.control}
              name="roomAssignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Room Assignment</FormLabel> {/* Styling */}
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
                  <FormLabel className="text-base font-semibold">Speaker</FormLabel> {/* Styling */}
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         </div>


        {/* Sponsorship (Optional) */}
        <FormField
          control={form.control}
          name="sponsorship"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Sponsorship <span className="text-muted-foreground text-sm">(Optional)</span></FormLabel> {/* Styling */}
              <FormControl>
                <Input placeholder="e.g., Tech Corp Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300 py-3 text-base font-semibold shadow-md"> {/* Enhanced styling */}
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
