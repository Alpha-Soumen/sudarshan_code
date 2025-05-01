
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Event, Registration } from '@/types/event';
import type { User } from '@/types/user';
import { MOCK_CURRENT_USER } from '@/types/user'; // Use mock user for now
import { getEvents, getRegistrationsForEvent } from '@/lib/events'; // Need to fetch user's registrations
import { generateParticipationCertificate } from '@/lib/certificates';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Award, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CertificateGeneratorProps {
    userId: string; // Pass the user ID for whom to generate certificates
}

export default function CertificateGenerator({ userId }: CertificateGeneratorProps) {
    const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const currentUser = MOCK_CURRENT_USER; // Get current user details (name mainly)

    useEffect(() => {
        async function fetchUserRegistrations() {
            setIsLoading(true);
            try {
                // In a real app, fetch registrations filtered by userId directly
                // For mock, fetch all events and registrations and filter
                const allEvents = await getEvents();
                const allRegistrations = await Promise.all(
                    allEvents.map(event => getRegistrationsForEvent(event.id))
                ).then(results => results.flat()); // Flatten the array of arrays

                const userRegisteredEventIds = allRegistrations
                    .filter(reg => reg.userId === userId)
                    .map(reg => reg.eventId);

                const eventsUserAttended = allEvents.filter(event =>
                    userRegisteredEventIds.includes(event.id)
                    // Optional: Add a check here if attendance needs to be confirmed
                    // before allowing certificate generation. This requires attendance data.
                );

                setRegisteredEvents(eventsUserAttended);
            } catch (err) {
                console.error("Failed to load user registration data:", err);
                toast({ title: "Error", description: "Could not load your registered events.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }

        if (userId) {
            fetchUserRegistrations();
        } else {
            setIsLoading(false); // No user ID, nothing to load
        }
    }, [userId, toast]);

    const handleGenerateCertificate = async () => {
        if (!selectedEventId || !currentUser) {
            toast({ title: "Selection Missing", description: "Please select an event.", variant: "destructive" });
            return;
        }

        const selectedEvent = registeredEvents.find(event => event.id === selectedEventId);
        if (!selectedEvent) {
            toast({ title: "Event Not Found", description: "Selected event data is missing.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            // This currently returns text for mocking purposes
            const certificateContent = await generateParticipationCertificate(currentUser, selectedEvent);

            // ---- Mock Download ----
            // In a real app, you'd get PDF bytes/blob and trigger a download
            const blob = new Blob([certificateContent], { type: 'text/plain' }); // Simulate with text
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${currentUser.name.replace(' ', '_')}_${selectedEvent.name.replace(' ', '_')}.txt`; // Use .pdf in real app
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            // -----------------------

            toast({ title: "Certificate Download Started", description: "Your certificate is being downloaded (mock)." });

        } catch (err) {
            console.error("Failed to generate certificate:", err);
            toast({ title: "Generation Failed", description: "Could not generate the certificate.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-md border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award /> Generate Certificate</CardTitle>
                <CardDescription>Download your participation certificate for completed events.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading your events...</span>
                    </div>
                ) : registeredEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center">You haven't registered for any events or no events are eligible for certification yet.</p>
                ) : (
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedEventId} value={selectedEventId} disabled={isGenerating}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {registeredEvents.map(event => (
                                    <SelectItem key={event.id} value={event.id}>
                                        {event.name} ({new Date(event.date).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleGenerateCertificate}
                            disabled={!selectedEventId || isGenerating}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" /> Download Certificate
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
