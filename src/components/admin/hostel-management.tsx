
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { RoomRequest, Complaint } from '@/types/hostel';
import { RequestStatus } from '@/types/hostel';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user';
import { getRoomRequests, getComplaints, updateRoomRequestStatus, updateComplaintStatus } from '@/lib/hostel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckSquare, XSquare, MailQuestion } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HostelManagementProps {
    // Props, if any
}

export default function HostelManagementPanel({}: HostelManagementProps) {
    const [requests, setRequests] = useState<RoomRequest[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingItemId, setEditingItemId] = useState<string | null>(null); // Track which item is being edited
    const [adminNotes, setAdminNotes] = useState<string>(''); // Notes for the currently edited item
    const { toast } = useToast();

    // Get current user (replace with actual auth context)
    const currentUser = MOCK_CURRENT_USER;
    const canManageHostel = hasPermission(currentUser, [UserRole.SuperAdmin]); // Define who can manage hostel issues

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const [requestsData, complaintsData] = await Promise.all([
                    getRoomRequests(), // Get all requests for admin view
                    getComplaints(),   // Get all complaints for admin view
                ]);
                setRequests(requestsData);
                setComplaints(complaintsData);
            } catch (err) {
                console.error("Failed to load hostel management data:", err);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
        if (canManageHostel) {
            fetchData();
        }
    }, [canManageHostel]);

    const handleStatusUpdate = async (itemId: string, type: 'request' | 'complaint', newStatus: RequestStatus) => {
        if (!editingItemId || editingItemId !== itemId) {
             toast({ title: "Error", description: "Please open the item editor first.", variant: "destructive" });
             return;
        }

        const updateFunction = type === 'request' ? updateRoomRequestStatus : updateComplaintStatus;
        const updateStateFunction = type === 'request' ? setRequests : setComplaints;

        try {
            const result = await updateFunction(itemId, newStatus, adminNotes || undefined); // Pass notes if any
            if (result.success && (result.request || result.complaint)) {
                toast({ title: "Status Updated", description: `${type === 'request' ? 'Request' : 'Complaint'} status changed to ${newStatus}.` });
                updateStateFunction(prevItems =>
                    prevItems.map(item => (item.id === itemId ? (result.request || result.complaint)! : item))
                );
                setEditingItemId(null); // Close editor on success
                setAdminNotes(''); // Clear notes
            } else {
                toast({ title: "Update Failed", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            console.error(`Failed to update ${type} status:`, err);
            toast({ title: "Error", description: `Could not update ${type} status.`, variant: "destructive" });
        }
    };

     const startEditing = (item: RoomRequest | Complaint) => {
        setEditingItemId(item.id);
        setAdminNotes(item.adminNotes || '');
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setAdminNotes('');
    };

    const getStatusBadgeVariant = (status: RequestStatus): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case RequestStatus.Resolved: return "default";
            case RequestStatus.InProgress: return "secondary";
            case RequestStatus.Pending: return "outline";
            case RequestStatus.Rejected: return "destructive";
            default: return "outline";
        }
    };


    if (!canManageHostel) {
        return (
             <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                 <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                     <CardHeader className="items-center">
                         <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-muted-foreground">
                             You do not have permission to manage hostel requests and complaints.
                         </p>
                     </CardContent>
                 </Card>
             </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-primary">Hostel Management</h1>
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading Requests & Complaints...</span>
                </div>
            </div>
        );
    }

     if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-destructive">Error</h1>
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    const renderItemDetails = (item: RoomRequest | Complaint) => (
         <>
            <p className="text-sm"><span className="font-semibold">User ID:</span> {item.userId}</p>
            {'currentRoomId' in item && item.currentRoomId && <p className="text-sm"><span className="font-semibold">Current Room ID:</span> {item.currentRoomId}</p>}
            {'preferredRoomId' in item && item.preferredRoomId && <p className="text-sm"><span className="font-semibold">Preferred Room ID:</span> {item.preferredRoomId}</p>}
            {'roomId' in item && item.roomId && <p className="text-sm"><span className="font-semibold">Related Room ID:</span> {item.roomId}</p>}
             {'category' in item && <p className="text-sm"><span className="font-semibold">Category:</span> {item.category}</p>}
             <p className="text-sm mt-2"><span className="font-semibold">Description:</span></p>
             <p className="text-sm bg-muted p-2 rounded">{item.description}</p>
             <p className="text-xs text-muted-foreground mt-2">Submitted: {new Date(item.submittedDate).toLocaleString()}</p>
             {item.resolvedDate && <p className="text-xs text-muted-foreground">Resolved/Rejected: {new Date(item.resolvedDate).toLocaleString()}</p>}

              {/* Admin Actions within Accordion Content */}
              {editingItemId === item.id ? (
                 <div className="mt-4 border-t pt-4">
                     <h4 className="text-sm font-semibold mb-2">Update Status & Add Notes</h4>
                     <Select
                         defaultValue={item.status}
                          onValueChange={(value) => handleStatusUpdate(item.id, 'requestType' in item ? 'request' : 'complaint', value as RequestStatus)}
                         >
                         <SelectTrigger className="mb-2">
                             <SelectValue placeholder="Select new status" />
                         </SelectTrigger>
                         <SelectContent>
                             {Object.values(RequestStatus).map(status => (
                                 <SelectItem key={status} value={status}>{status}</SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                     <Textarea
                         placeholder="Add optional admin notes..."
                         value={adminNotes}
                         onChange={(e) => setAdminNotes(e.target.value)}
                         className="mb-2"
                         rows={2}
                     />
                     <div className="flex gap-2">
                         {/* Save is implicit via Select change */}
                         <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel Edit</Button>
                     </div>
                 </div>
              ) : (
                   <Button size="sm" variant="outline" className="mt-3" onClick={() => startEditing(item)}>Update Status</Button>
              )}
              {item.adminNotes && editingItemId !== item.id && (
                    <div className="mt-2 border-t pt-2">
                        <p className="text-sm font-semibold">Admin Notes:</p>
                        <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">{item.adminNotes}</p>
                    </div>
                )}

         </>
     );


    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-primary">Hostel Request & Complaint Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Room Requests Section */}
                <Card className="shadow-md border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MailQuestion /> Room Requests</CardTitle>
                        <CardDescription>Review and manage student room change and maintenance requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No pending or historical room requests.</p>
                        ) : (
                            <Accordion type="multiple" className="w-full">
                                {requests.map(req => (
                                     <AccordionItem key={req.id} value={req.id}>
                                        <AccordionTrigger className="text-left hover:no-underline">
                                             <div className="flex justify-between items-center w-full pr-4">
                                                 <span>{req.requestType} Request (User: {req.userId.substring(0,8)}...)</span>
                                                 <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                                             </div>
                                         </AccordionTrigger>
                                        <AccordionContent className="px-4">
                                             {renderItemDetails(req)}
                                         </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>

                {/* Complaints Section */}
                <Card className="shadow-md border">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><AlertCircle /> Complaints</CardTitle>
                        <CardDescription>Address and resolve student complaints regarding hostel life.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {complaints.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No pending or historical complaints.</p>
                        ) : (
                             <Accordion type="multiple" className="w-full">
                                {complaints.map(comp => (
                                    <AccordionItem key={comp.id} value={comp.id}>
                                         <AccordionTrigger className="text-left hover:no-underline">
                                             <div className="flex justify-between items-center w-full pr-4">
                                                 <span>{comp.category} Complaint (User: {comp.userId.substring(0,8)}...)</span>
                                                 <Badge variant={getStatusBadgeVariant(comp.status)}>{comp.status}</Badge>
                                             </div>
                                         </AccordionTrigger>
                                         <AccordionContent className="px-4">
                                             {renderItemDetails(comp)}
                                         </AccordionContent>
                                     </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
