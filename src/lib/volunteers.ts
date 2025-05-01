
import type { Volunteer } from '@/types/volunteer';
import type { Event } from '@/types/event'; // Assuming event data might be needed

// Mock in-memory data store for volunteers
let volunteers: Volunteer[] = [
  {
    id: 'vol1',
    name: 'Alice Volunteer',
    email: 'alice.v@example.com',
    assignedEventIds: ['evt1'],
    attendance: { 'evt1': false }, // Not attended yet
    tasks: { 'evt1': 'Registration Desk' },
  },
  {
    id: 'vol2',
    name: 'Bob Helper',
    email: 'bob.h@example.com',
    assignedEventIds: ['evt1'],
    attendance: {},
    tasks: { 'evt1': 'Usher' },
  },
  {
    id: 'vol3',
    name: 'Charlie Support',
    email: 'charlie.s@example.com',
    assignedEventIds: ['evt2'],
    attendance: { 'evt2': true }, // Attended evt2
    tasks: { 'evt2': 'AV Support' },
  },
];

// --- Volunteer Functions ---

export async function getVolunteers(): Promise<Volunteer[]> {
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
  return JSON.parse(JSON.stringify(volunteers));
}

export async function getVolunteerById(id: string): Promise<Volunteer | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const volunteer = volunteers.find((v) => v.id === id);
  return volunteer ? JSON.parse(JSON.stringify(volunteer)) : undefined;
}

export async function createVolunteer(volunteerData: Omit<Volunteer, 'id' | 'assignedEventIds' | 'attendance' | 'tasks'>): Promise<Volunteer> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const newVolunteer: Volunteer = {
    ...volunteerData,
    id: `vol${Date.now()}`,
    assignedEventIds: [],
    attendance: {},
    tasks: {},
  };
  volunteers.push(newVolunteer);
  console.log('Created new volunteer:', newVolunteer);
  return JSON.parse(JSON.stringify(newVolunteer));
}

export async function updateVolunteerAssignment(volunteerId: string, eventId: string, assigned: boolean): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const volIndex = volunteers.findIndex(v => v.id === volunteerId);
    if (volIndex === -1) {
        return { success: false, message: "Volunteer not found." };
    }

    const currentAssignments = volunteers[volIndex].assignedEventIds;
    if (assigned && !currentAssignments.includes(eventId)) {
        volunteers[volIndex].assignedEventIds.push(eventId);
         // Also call the event update function (imported or handled separately)
        // await assignVolunteerToEvent(eventId, volunteerId);
         console.log(`Assigned volunteer ${volunteerId} to event ${eventId}`);
    } else if (!assigned && currentAssignments.includes(eventId)) {
        volunteers[volIndex].assignedEventIds = currentAssignments.filter(id => id !== eventId);
         // Also call the event update function
        // await removeVolunteerFromEvent(eventId, volunteerId);
         console.log(`Removed volunteer ${volunteerId} from event ${eventId}`);
    }
    return { success: true, message: "Volunteer assignment updated." };
}

export async function trackVolunteerAttendance(volunteerId: string, eventId: string, attended: boolean): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const volIndex = volunteers.findIndex(v => v.id === volunteerId);
    if (volIndex === -1) {
        return { success: false, message: "Volunteer not found." };
    }
     if (!volunteers[volIndex].assignedEventIds.includes(eventId)) {
        return { success: false, message: "Volunteer not assigned to this event." };
    }

    volunteers[volIndex].attendance[eventId] = attended;
    console.log(`Updated attendance for volunteer ${volunteerId} at event ${eventId}: ${attended}`);
    return { success: true, message: "Attendance updated." };
}

export async function assignVolunteerTask(volunteerId: string, eventId: string, task: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const volIndex = volunteers.findIndex(v => v.id === volunteerId);
     if (volIndex === -1) {
        return { success: false, message: "Volunteer not found." };
    }
     if (!volunteers[volIndex].assignedEventIds.includes(eventId)) {
        return { success: false, message: "Volunteer not assigned to this event." };
    }
     if (!volunteers[volIndex].tasks) {
         volunteers[volIndex].tasks = {};
     }

    volunteers[volIndex].tasks![eventId] = task;
    console.log(`Assigned task "${task}" to volunteer ${volunteerId} for event ${eventId}`);
    return { success: true, message: "Task assigned." };
}
