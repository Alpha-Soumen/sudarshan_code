
'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Event, Registration } from '@/types/event';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER } from '@/types/user'; // Use mock user
import { getEvents, registerForEvent } from '@/lib/events';
import { uploadDocument } from '@/lib/documents'; // Import the upload simulation function
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileCheck, AlertCircle, UserPlus, Ticket } from 'lucide-react';

// Define Zod schema for the form, including file upload
const registrationSchema = z.object({
  eventId: z.string().min(1, { message: 'Please select an event.' }),
  // Add other onboarding fields as needed (e.g., name, email if not pre-filled)
  // For simplicity, we'll assume user is logged in and we have their ID.
  document: z
    .custom<FileList>((val) => val instanceof FileList, "Input is not a FileList")
    .refine((val) => val.length > 0, `Please upload the required document.`) // Check if file list is not empty
    .refine((val) => val.length <= 1, `Only one file can be uploaded.`) // Ensure only one file
    .refine((val) => val[0]?.size <= 5 * 1024 * 1024, `File size must be less than 5MB.`) // Max 5MB
    .refine(
      (val) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(val[0]?.type),
      "Only PDF, JPG, PNG, or WEBP files are allowed."
    )
    .optional(), // Make the document optional for now, can be required based on event settings
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationDesk() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null); // Simulate progress
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null); // Store URL after successful upload
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    const currentUser = MOCK_CURRENT_USER; // Replace with actual auth context
    // This component might be used by students or admins assisting registration
    const canRegister = currentUser?.role === UserRole.Student || currentUser?.role === UserRole.SuperAdmin;

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { eventId: '' },
    });

     // Watch the file input value for display purposes
    const selectedFile = form.watch('document');

    useEffect(() => {
        async function fetchEventsData() {
            setIsLoadingEvents(true);
            try {
                const eventsData = await getEvents();
                 // Filter out full events if needed, or handle in registration logic
                setEvents(eventsData);
            } catch (err) {
                console.error("Failed to load events:", err);
                toast({ title: "Error", description: "Could not load available events.", variant: "destructive" });
            } finally {
                setIsLoadingEvents(false);
            }
        }
        fetchEventsData();
    }, [toast]);

     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
             form.setValue('document', files, { shouldValidate: true });
             setUploadedFileUrl(null); // Clear previous upload URL if a new file is selected
        } else {
             form.setValue('document', undefined); // Clear value if no file selected
        }
    };

    const onSubmit = async (values: RegistrationFormData) => {
        if (!currentUser?.id) {
             toast({ title: "Login Required", description: "Please log in to register.", variant: "destructive" });
             return;
        }

        setIsSubmitting(true);
        setUploadProgress(null);
        setUploadedFileUrl(null);
        let documentUrl: string | undefined = undefined;

        // 1. Handle File Upload (if a file is selected)
        if (values.document && values.document.length > 0) {
            const file = values.document[0];
            setUploadProgress(0); // Indicate start
            try {
                 // Simulate progress - in reality, use upload task events
                 await new Promise(res => setTimeout(res, 300)); setUploadProgress(30);
                 await new Promise(res => setTimeout(res, 500)); setUploadProgress(70);

                const uploadResult = await uploadDocument(file, currentUser.id, values.eventId);
                setUploadProgress(100); // Indicate completion attempt

                if (uploadResult.success && uploadResult.fileUrl) {
                    documentUrl = uploadResult.fileUrl;
                    setUploadedFileUrl(documentUrl); // Store for potential display
                    toast({ title: "Upload Successful", description: `${uploadResult.fileName} uploaded.` });
                } else {
                    toast({ title: "Upload Failed", description: uploadResult.message, variant: "destructive" });
                    setIsSubmitting(false);
                    setUploadProgress(null);
                    return; // Stop registration if upload fails
                }
            } catch (err) {
                console.error("File upload error:", err);
                toast({ title: "Upload Error", description: "Could not upload the document.", variant: "destructive" });
                setIsSubmitting(false);
                setUploadProgress(null);
                return;
            }
        }

        // 2. Proceed with Event Registration
        try {
            // Pass the uploaded document URL (if any) to the registration function
            const registrationResult = await registerForEvent(values.eventId, currentUser.id, documentUrl);

            if (registrationResult.success && registrationResult.registration) {
                toast({
                    title: "Registration Successful!",
                    description: `You are registered for the event. Your token: ${registrationResult.registration.token}`,
                });
                form.reset(); // Reset form fields
                 if (fileInputRef.current) { fileInputRef.current.value = ''; } // Clear file input visually
                 setUploadedFileUrl(null); // Clear URL state
            } else {
                toast({ title: "Registration Failed", description: registrationResult.message, variant: "destructive" });
                 // Optionally handle specific errors, e.g., if event is full after upload
            }
        } catch (err) {
            console.error("Registration error:", err);
            toast({ title: "Registration Error", description: "An unexpected error occurred during registration.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(null);
        }
    };

     if (!canRegister) {
         return (
              <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                 <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                      <CardHeader className="items-center">
                         <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                     </CardHeader>
                      <CardContent>
                         <p className="text-muted-foreground">
                             You do not have permission to access the registration desk.
                         </p>
                     </CardContent>
                 </Card>
             </div>
         );
     }

    return (
        <div className="container mx-auto py-8 px-4 flex justify-center">
            <Card className="w-full max-w-lg shadow-lg border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><UserPlus /> Event Registration</CardTitle>
                    <CardDescription>Select an event and upload any required documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Event Selection */}
                            <FormField
                                control={form.control}
                                name="eventId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Event*</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingEvents || isSubmitting}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingEvents ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : events.length === 0 ? (
                                                    <SelectItem value="no-events" disabled>No upcoming events found</SelectItem>
                                                ) : (
                                                    events.map(event => {
                                                        const isFull = event.registeredSeats >= event.totalSeats;
                                                        return (
                                                            <SelectItem key={event.id} value={event.id} disabled={isFull}>
                                                                {event.name} ({new Date(event.date).toLocaleDateString()}) {isFull ? '- Full' : `- ${event.totalSeats - event.registeredSeats} left`}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             {/* --- Add other onboarding fields here if needed --- */}
                             {/* Example:
                             <FormField name="studentId" render={...} />
                             <FormField name="department" render={...} />
                             */}

                            {/* Document Upload */}
                             <FormField
                                control={form.control}
                                name="document"
                                render={({ field: { value, onChange, ...fieldProps } }) => ( // Destructure to use custom onChange
                                    <FormItem>
                                        <FormLabel>Upload Document (Optional - PDF, JPG, PNG, WEBP &lt; 5MB)</FormLabel>
                                        <FormControl>
                                            <Input
                                                 {...fieldProps}
                                                 ref={fileInputRef} // Assign ref
                                                 type="file"
                                                 accept=".pdf, .jpg, .jpeg, .png, .webp"
                                                 onChange={handleFileChange} // Use custom handler
                                                 disabled={isSubmitting}
                                                 className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                         </FormControl>
                                        {/* Display selected file name */}
                                        {selectedFile && selectedFile.length > 0 && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Selected: {selectedFile[0].name} ({(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
                                        {/* Display Upload Progress / Success */}
                                        {uploadProgress !== null && (
                                            <div className="mt-2">
                                                 <div className="w-full bg-muted rounded-full h-2.5">
                                                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                 </div>
                                                 <p className="text-xs text-center mt-1">{uploadProgress === 100 ? (uploadedFileUrl ? "Upload Complete" : "Processing...") : `Uploading... ${uploadProgress}%`}</p>
                                            </div>
                                        )}
                                        {uploadedFileUrl && uploadProgress === 100 && (
                                            <p className="text-sm text-green-600 flex items-center gap-1 mt-1"><FileCheck className="h-4 w-4"/> Document ready.</p>
                                        )}

                                        <FormMessage /> {/* Display Zod validation errors */}
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isSubmitting || isLoadingEvents} className="w-full">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {uploadProgress !== null ? 'Uploading...' : 'Registering...'}
                                    </>
                                ) : (
                                    <>
                                        <Ticket className="mr-2 h-4 w-4" /> Register for Event
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
