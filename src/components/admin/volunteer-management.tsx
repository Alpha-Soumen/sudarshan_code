
'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import type { Volunteer } from '@/types/volunteer';
import type { Event } from '@/types/event';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user'; // Assuming you have role definitions and a way to get current user
import { getVolunteers, trackVolunteerAttendance, assignVolunteerTask } from '@/lib/volunteers';
import { getEvents, assignVolunteerToEvent, removeVolunteerFromEvent } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, UserX, Edit, Save, Ban, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VolunteerManagementProps {
  // Could accept initial data or filters if needed
}

interface VolunteerWithAssignments extends Volunteer {
  assignments: {
    eventId: string;
    eventName: string;
    attended: boolean;
    task?: string;
  }[];
}

export default function VolunteerManagementPanel({}: VolunteerManagementProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ volunteerId: string; eventId: string; currentTask: string } | null>(null);
  const { toast } = useToast();

  // Get current user (replace with actual auth context)
  const currentUser = MOCK_CURRENT_USER; // Use the mock user for now
  const canManageVolunteers = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.EventManager]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [volunteersData, eventsData] = await Promise.all([
          getVolunteers(),
          getEvents()
        ]);
        setVolunteers(volunteersData);
        setEvents(eventsData);
      } catch (err) {
        console.error("Failed to load volunteer/event data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    if (canManageVolunteers) {
      fetchData();
    }
  }, [canManageVolunteers]);

  const handleAssignVolunteer = async (volunteerId: string, eventId: string, assign: boolean) => {
      const action = assign ? assignVolunteerToEvent : removeVolunteerFromEvent;
      const updateLocalVolunteerState = () => {
          setVolunteers(prev => prev.map(vol => {
              if (vol.id === volunteerId) {
                  let updatedIds = [...vol.assignedEventIds];
                  if (assign && !updatedIds.includes(eventId)) {
                      updatedIds.push(eventId);
                  } else if (!assign) {
                      updatedIds = updatedIds.filter(id => id !== eventId);
                  }
                  // Optionally update attendance/tasks if needed when unassigning
                  const updatedAttendance = { ...vol.attendance };
                  const updatedTasks = { ...vol.tasks };
                  if (!assign) {
                    delete updatedAttendance[eventId];
                    if (updatedTasks) delete updatedTasks[eventId];
                  }

                  return { ...vol, assignedEventIds: updatedIds, attendance: updatedAttendance, tasks: updatedTasks };
              }
              return vol;
          }));
      };

      try {
          // Update backend first
          const result = await action(eventId, volunteerId);
          if (result.success) {
              toast({ title: assign ? "Volunteer Assigned" : "Volunteer Removed", description: result.message });
              // Update local state on success
              updateLocalVolunteerState();
          } else {
              toast({ title: "Error", description: result.message, variant: "destructive" });
          }
      } catch (err) {
          console.error(`Failed to ${assign ? 'assign' : 'remove'} volunteer:`, err);
          toast({ title: "Error", description: `Could not ${assign ? 'assign' : 'remove'} volunteer.`, variant: "destructive" });
      }
  };


  const handleAttendanceChange = async (volunteerId: string, eventId: string, attended: boolean) => {
    try {
      const result = await trackVolunteerAttendance(volunteerId, eventId, attended);
      if (result.success) {
        toast({ title: "Attendance Updated", description: `Marked as ${attended ? 'attended' : 'not attended'}.` });
        // Update local state
        setVolunteers(prev => prev.map(vol => {
          if (vol.id === volunteerId) {
            return { ...vol, attendance: { ...vol.attendance, [eventId]: attended } };
          }
          return vol;
        }));
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to update attendance:", err);
      toast({ title: "Error", description: "Could not update attendance.", variant: "destructive" });
    }
  };

  const handleTaskSave = async () => {
      if (!editingTask) return;
      const { volunteerId, eventId, currentTask } = editingTask;
      const trimmedTask = currentTask.trim(); // Trim task input

      // Prevent saving empty task if not intended
      if (!trimmedTask) {
          toast({ title: "Task Cannot Be Empty", description: "Please enter a task or cancel.", variant: "destructive" });
          return;
      }

      try {
          const result = await assignVolunteerTask(volunteerId, eventId, trimmedTask); // Use trimmed task
          if (result.success) {
              toast({ title: "Task Assigned", description: `Task updated for event.` });
              // Update local state
              setVolunteers(prev => prev.map(vol => {
                  if (vol.id === volunteerId) {
                      return { ...vol, tasks: { ...(vol.tasks || {}), [eventId]: trimmedTask } }; // Save trimmed task
                  }
                  return vol;
              }));
              setEditingTask(null); // Exit editing mode
          } else {
              toast({ title: "Error Assigning Task", description: result.message, variant: "destructive" });
          }
      } catch (err) {
          console.error("Failed to assign task:", err);
          toast({ title: "Error", description: "Could not assign task.", variant: "destructive" });
      }
  };

    const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingTask) {
            setEditingTask({ ...editingTask, currentTask: e.target.value });
        }
    };

   const startEditingTask = (volunteerId: string, eventId: string, task: string | undefined) => {
        setEditingTask({ volunteerId, eventId, currentTask: task || '' });
    };

    const cancelEditingTask = () => {
        setEditingTask(null);
    };


  // Memoize the processed data to avoid re-computation on every render
  const volunteersWithAssignments = useMemo(() => {
    return volunteers.map(vol => {
      const assignments = vol.assignedEventIds.map(eventId => {
        const event = events.find(e => e.id === eventId);
        return {
          eventId: eventId,
          eventName: event?.name || 'Event Not Found',
          attended: vol.attendance?.[eventId] ?? false,
          task: vol.tasks?.[eventId]
        };
      }).filter(assignment => assignment.eventName !== 'Event Not Found'); // Filter out if event is missing
      return { ...vol, assignments };
    });
  }, [volunteers, events]);


  if (!canManageVolunteers) {
      return (
        <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
            <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                 <CardHeader className="items-center">
                     <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                     <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-muted-foreground">
                         You do not have permission to manage volunteers. Please contact a Super Admin if you believe this is an error.
                     </p>
                 </CardContent>
             </Card>
        </div>
    );
  }


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Manage Volunteers</h2>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Volunteer Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-4 text-destructive">Error</h2>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Volunteer Management</h1>

      {/* Assign Volunteers to Events */}
      <Card className="mb-8 shadow-md border">
        <CardHeader>
          <CardTitle>Assign Volunteers to Events</CardTitle>
           <CardDescription>Select an event and assign available volunteers.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="volunteer-select" className="text-sm font-medium">Volunteer</label>
                    <Select onValueChange={(volunteerId) => { /* Store selected volunteer ID if needed */ }}>
                        <SelectTrigger id="volunteer-select">
                            <SelectValue placeholder="Select a Volunteer" />
                        </SelectTrigger>
                        <SelectContent>
                            {volunteers.map(vol => (
                                <SelectItem key={vol.id} value={vol.id}>
                                    {vol.name} ({vol.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                     <label htmlFor="event-select-assign" className="text-sm font-medium">Event</label>
                     <Select onValueChange={(eventId) => { /* Store selected event ID */ }}>
                         <SelectTrigger id="event-select-assign">
                             <SelectValue placeholder="Select an Event" />
                         </SelectTrigger>
                         <SelectContent>
                             {events.map(evt => (
                                 <SelectItem key={evt.id} value={evt.id}>
                                     {evt.name} ({new Date(evt.date).toLocaleDateString()})
                                 </SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                 </div>
            </div>
           {/* Add Assign/Remove Button Logic Here - Requires storing selectedVolunteerId and selectedEventId in state */}
           {/* Example Button (needs state management) */}
           {/* <Button className="mt-4" onClick={() => handleAssignVolunteer(selectedVolunteerId, selectedEventId, true)}>Assign</Button> */}
           <p className="text-sm text-muted-foreground mt-4">Note: Select a volunteer and event, then use the table below to manage assignments.</p>
        </CardContent>
      </Card>


      {/* Volunteer List & Details Table */}
      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle>Volunteer Details & Assignments</CardTitle>
           <CardDescription>Track attendance, assign tasks, and manage event assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Event</TableHead>
                  <TableHead className="text-center">Attended?</TableHead>
                  <TableHead>Task</TableHead>
                   <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteersWithAssignments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                            No volunteers found or assigned yet.
                        </TableCell>
                    </TableRow>
                ) : (
                 volunteersWithAssignments.flatMap(vol =>
                  // If volunteer has no assignments, show a row for them
                  vol.assignments.length === 0 ? (
                       <TableRow key={vol.id}>
                         <TableCell className="font-medium">{vol.name}</TableCell>
                         <TableCell>{vol.email}</TableCell>
                         <TableCell className="text-muted-foreground italic">No assignments</TableCell>
                         <TableCell></TableCell>
                         <TableCell></TableCell>
                         <TableCell className="text-center">
                             {/* Maybe add a button to assign to the first event? */}
                         </TableCell>
                       </TableRow>
                  ) : (
                   // If assignments exist, map over them
                   vol.assignments.map((assign, index) => (
                     <TableRow key={`${vol.id}-${assign.eventId}`}>
                       {/* Show volunteer name+email only on the first row for that volunteer */}
                       {index === 0 ? (
                         <>
                           <TableCell className="font-medium">{vol.name}</TableCell>
                           <TableCell>{vol.email}</TableCell>
                         </>
                       ) : (
                         <>
                           <TableCell></TableCell>
                           <TableCell></TableCell>
                         </>
                       )}
                       <TableCell>{assign.eventName}</TableCell>
                       <TableCell className="text-center">
                         <Checkbox
                           checked={assign.attended}
                           onCheckedChange={(checked) => handleAttendanceChange(vol.id, assign.eventId, Boolean(checked))}
                           aria-label={`Mark ${vol.name} attendance for ${assign.eventName}`}
                         />
                       </TableCell>
                       <TableCell>
                           {editingTask?.volunteerId === vol.id && editingTask?.eventId === assign.eventId ? (
                               <div className="flex items-center gap-1">
                                   <Input
                                       value={editingTask.currentTask}
                                       onChange={handleTaskInputChange}
                                       placeholder="Enter task..."
                                       className="h-8 text-sm"
                                   />
                                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTaskSave} aria-label="Save task">
                                       <Save className="h-4 w-4" />
                                   </Button>
                                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEditingTask} aria-label="Cancel editing task">
                                       <Ban className="h-4 w-4" />
                                   </Button>
                               </div>
                           ) : (
                               <div className="flex items-center justify-between">
                                   <span>{assign.task || <span className="text-muted-foreground text-xs italic">No task</span>}</span>
                                   <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-6 w-6 ml-2"
                                       onClick={() => startEditingTask(vol.id, assign.eventId, assign.task)}
                                       aria-label="Edit task"
                                   >
                                       <Edit className="h-3 w-3" />
                                   </Button>
                               </div>
                           )}
                       </TableCell>
                       <TableCell className="text-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${vol.name} from ${assign.eventName}`}>
                                     <UserX className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {vol.name} from the event "{assign.eventName}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleAssignVolunteer(vol.id, assign.eventId, false)}
                                    >
                                      Remove Volunteer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                     </TableRow>
                   ))
                  ) // End mapping assignments
                 ) // End flatMap volunteers
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
