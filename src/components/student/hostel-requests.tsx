
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { RoomRequest, Complaint, HostelRoom } from '@/types/hostel';
import { RequestStatus } from '@/types/hostel';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user'; // Use mock user for now
import { getHostelRooms, createRoomRequest, createComplaint, getRoomRequests, getComplaints } from '@/lib/hostel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Send, ListChecks, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schemas for forms
const roomRequestSchema = z.object({
  requestType: z.enum(['Change', 'Maintenance']),
  currentRoomId: z.string().optional(), // Optional for maintenance if they don't know room ID? Maybe make required based on logic.
  preferredRoomId: z.string().optional().refine((data, ctx) => {
     // Make preferredRoomId required only if requestType is 'Change'
     const { requestType, preferredRoomId } = ctx.parent;
     if (requestType === 'Change' && !preferredRoomId) {
         return false;
     }
     return true;
  }, { message: 'Preferred room is required for change requests.'}),
  description: z.string().min(10, 'Please provide more details (min 10 chars).').max(500),
});

const complaintSchema = z.object({
    roomId: z.string().optional(), // Can complain about general issues
    category: z.string().min(1, 'Category is required.'), // Could be enum: ['Noise', 'Cleanliness', 'Safety', 'Other']
    description: z.string().min(10, 'Please describe the complaint (min 10 chars).').max(500),
});

type RoomRequestFormData = z.infer<typeof roomRequestSchema>;
type ComplaintFormData = z.infer<typeof complaintSchema>;

export default function HostelRequestSystem() {
    const [myRequests, setMyRequests] = useState<RoomRequest[]>([]);
    const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
    const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Get current user (replace with actual auth context)
    const currentUser = MOCK_CURRENT_USER; // Use the mock user for now
    // This component is intended for students, but check anyway
    const isStudent = currentUser?.role === UserRole.Student || currentUser?.role === UserRole.SuperAdmin; // Allow admin for testing

    const requestForm = useForm<RoomRequestFormData>({
        resolver: zodResolver(roomRequestSchema),
        defaultValues: { requestType: 'Maintenance', description: '' },
    });

    const complaintForm = useForm<ComplaintFormData>({
        resolver: zodResolver(complaintSchema),
        defaultValues: { category: '', description: '' },
    });

    useEffect(() => {
        async function fetchData() {
            if (!currentUser?.id || !isStudent) return;
            setIsLoading(true);
            setError(null);
            try {
                const [requests, complaints, rooms] = await Promise.all([
                    getRoomRequests().then(all => all.filter(r => r.userId === currentUser.id)), // Filter for current user
                    getComplaints().then(all => all.filter(c => c.userId === currentUser.id)), // Filter for current user
                    getHostelRooms(),
                ]);
                setMyRequests(requests);
                setMyComplaints(complaints);
                setHostelRooms(rooms);
            } catch (err) {
                console.error("Failed to load hostel data:", err);
                setError("Failed to load your hostel requests/complaints.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [currentUser?.id, isStudent]); // Re-fetch if user changes


    const handleRoomRequestSubmit = async (values: RoomRequestFormData) => {
        if (!currentUser?.id) return;
        setIsSubmitting(true);
        try {
             // Find the user's current room if not explicitly provided? Depends on data model.
            // For now, assume currentRoomId might be needed from user profile or selection.
             const requestData = {
                ...values,
                userId: currentUser.id,
                // Ensure optional fields are handled if not provided
                currentRoomId: values.currentRoomId || undefined,
                preferredRoomId: values.preferredRoomId || undefined,
            };
            const newRequest = await createRoomRequest(requestData);
            toast({ title: "Request Submitted", description: "Your room request has been received." });
            setMyRequests(prev => [...prev, newRequest]); // Add to local state
            requestForm.reset();
        } catch (err) {
            console.error("Failed to submit room request:", err);
            toast({ title: "Submission Failed", description: "Could not submit your request.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplaintSubmit = async (values: ComplaintFormData) => {
         if (!currentUser?.id) return;
        setIsSubmitting(true);
        try {
            const complaintData = {
                 ...values,
                 userId: currentUser.id,
                 roomId: values.roomId || undefined,
             };
            const newComplaint = await createComplaint(complaintData);
            toast({ title: "Complaint Submitted", description: "Your complaint has been registered." });
            setMyComplaints(prev => [...prev, newComplaint]); // Add to local state
            complaintForm.reset();
        } catch (err) {
            console.error("Failed to submit complaint:", err);
            toast({ title: "Submission Failed", description: "Could not submit your complaint.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadgeVariant = (status: RequestStatus): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case RequestStatus.Resolved: return "default"; // Greenish in default theme
            case RequestStatus.InProgress: return "secondary"; // Yellowish/Blueish
            case RequestStatus.Pending: return "outline"; // Grayish
            case RequestStatus.Rejected: return "destructive"; // Red
            default: return "outline";
        }
    };

     if (!isStudent) {
         return (
             <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                 {/* ... Access Denied Card (similar to other components) ... */}
                  <p>This section is for students.</p>
             </div>
         );
     }


    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-primary">Hostel Requests & Complaints</h1>

            <Tabs defaultValue="new_request" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="new_request"><PlusCircle className="mr-2 h-4 w-4"/>New Request</TabsTrigger>
                    <TabsTrigger value="new_complaint"><PlusCircle className="mr-2 h-4 w-4"/>New Complaint</TabsTrigger>
                    <TabsTrigger value="history"><ListChecks className="mr-2 h-4 w-4"/>My History</TabsTrigger>
                </TabsList>

                {/* New Request Tab */}
                <TabsContent value="new_request">
                    <Card className="shadow-md border">
                        <CardHeader>
                            <CardTitle>Submit Room Request</CardTitle>
                            <CardDescription>Request a room change or report a maintenance issue.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...requestForm}>
                                <form onSubmit={requestForm.handleSubmit(handleRoomRequestSubmit)} className="space-y-6">
                                    <FormField
                                        control={requestForm.control}
                                        name="requestType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Request Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select request type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Maintenance">Maintenance Issue</SelectItem>
                                                        <SelectItem value="Change">Room Change</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Conditional Fields */}
                                    <FormField
                                        control={requestForm.control}
                                        name="currentRoomId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Your Current Room</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                     <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select your current room (if applicable)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                     <SelectContent>
                                                        {hostelRooms.map(room => (
                                                            <SelectItem key={room.id} value={room.id}>Block {room.block} - Room {room.roomNumber}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     {/* Show Preferred Room only for 'Change' requests */}
                                     {requestForm.watch('requestType') === 'Change' && (
                                        <FormField
                                            control={requestForm.control}
                                            name="preferredRoomId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preferred Room (Optional)</FormLabel>
                                                     <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select preferred room (if any)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                         <SelectContent>
                                                            {hostelRooms.map(room => (
                                                                <SelectItem key={room.id} value={room.id} disabled={room.occupants.length >= room.capacity}>
                                                                    Block {room.block} - Room {room.roomNumber} ({room.occupants.length}/{room.capacity} occupants)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}


                                    <FormField
                                        control={requestForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Details</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Describe the maintenance issue or reason for room change request..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit Request
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* New Complaint Tab */}
                <TabsContent value="new_complaint">
                    <Card className="shadow-md border">
                         <CardHeader>
                            <CardTitle>Submit Complaint</CardTitle>
                            <CardDescription>Report any issues or concerns regarding hostel facilities or environment.</CardDescription>
                        </CardHeader>
                         <CardContent>
                             <Form {...complaintForm}>
                                <form onSubmit={complaintForm.handleSubmit(handleComplaintSubmit)} className="space-y-6">
                                     <FormField
                                        control={complaintForm.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Complaint Category</FormLabel>
                                                 {/* Using Input for flexibility, could be Select */}
                                                <FormControl>
                                                    <Input placeholder="e.g., Noise, Cleanliness, Safety, Staff Behavior, Other" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={complaintForm.control}
                                        name="roomId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Related Room (Optional)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                     <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select room if applicable" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                     <SelectContent>
                                                        {hostelRooms.map(room => (
                                                            <SelectItem key={room.id} value={room.id}>Block {room.block} - Room {room.roomNumber}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={complaintForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Complaint Details</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Please provide a detailed description of the complaint..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit Complaint
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Room Requests History */}
                        <Card className="shadow-md border">
                            <CardHeader>
                                <CardTitle>My Room Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/></div>
                                ) : error ? (
                                    <p className="text-destructive">{error}</p>
                                ) : myRequests.length === 0 ? (
                                    <p className="text-muted-foreground">You haven't submitted any room requests.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {myRequests.map(req => (
                                            <li key={req.id} className="border-b pb-3 last:border-b-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold">Type: {req.requestType}</span>
                                                     <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">Submitted: {new Date(req.submittedDate).toLocaleDateString()}</p>
                                                 <p className="text-sm mb-1">Details: {req.description}</p>
                                                {req.adminNotes && <p className="text-xs bg-secondary/50 p-1 rounded">Admin Note: {req.adminNotes}</p>}
                                                 {req.resolvedDate && <p className="text-xs text-muted-foreground">Resolved: {new Date(req.resolvedDate).toLocaleDateString()}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Complaints History */}
                        <Card className="shadow-md border">
                            <CardHeader>
                                <CardTitle>My Complaints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/></div>
                                ) : error ? (
                                    <p className="text-destructive">{error}</p>
                                ) : myComplaints.length === 0 ? (
                                    <p className="text-muted-foreground">You haven't submitted any complaints.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {myComplaints.map(comp => (
                                            <li key={comp.id} className="border-b pb-3 last:border-b-0">
                                                 <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold">Category: {comp.category}</span>
                                                     <Badge variant={getStatusBadgeVariant(comp.status)}>{comp.status}</Badge>
                                                </div>
                                                 <p className="text-sm text-muted-foreground mb-1">Submitted: {new Date(comp.submittedDate).toLocaleDateString()}</p>
                                                <p className="text-sm mb-1">Details: {comp.description}</p>
                                                 {comp.adminNotes && <p className="text-xs bg-secondary/50 p-1 rounded">Admin Note: {comp.adminNotes}</p>}
                                                 {comp.resolvedDate && <p className="text-xs text-muted-foreground">Resolved: {new Date(comp.resolvedDate).toLocaleDateString()}</p>}
                                           </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                     </div>
                 </TabsContent>

            </Tabs>
        </div>
    );
}
