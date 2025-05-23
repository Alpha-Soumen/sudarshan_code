import type { Event, Registration } from '@/types/event';
import { generateToken } from './tokens';

// Mock in-memory data store
let events: Event[] = [
  {
    id: 'evt1',
    name: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks and how to use them effectively.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
    totalSeats: 50,
    registeredSeats: 15,
    roomAssignment: 'Room A101',
    speaker: 'Jane Doe',
    cost: 0,
    sponsorship: 'Tech Corp',
    estimatedCost: 200,
    sponsorshipAmount: 500,
    assignedVolunteers: ['vol1', 'vol2'],
  },
  {
    id: 'evt2',
    name: 'Advanced TypeScript Techniques',
    description: 'Dive deep into advanced TypeScript features like conditional types and mapped types.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Two weeks from now
    totalSeats: 30,
    registeredSeats: 28,
    roomAssignment: 'Room B205',
    speaker: 'John Smith',
    cost: 25,
    estimatedCost: 150,
    sponsorshipAmount: 100,
    assignedVolunteers: ['vol3'],
  },
   {
    id: 'evt3',
    name: 'Next.js for Production',
    description: 'Best practices for deploying and scaling Next.js applications.',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // Three weeks from now
    totalSeats: 40,
    registeredSeats: 40, // Full
    roomAssignment: 'Auditorium',
    speaker: 'Alice Green',
    cost: 50,
    sponsorship: 'Vercel',
    estimatedCost: 500,
    sponsorshipAmount: 1000,
    assignedVolunteers: [], // No volunteers assigned yet
  },
];

let registrations: Registration[] = [];

// --- Event Functions ---

export async function getEvents(): Promise<Event[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Return a deep copy to prevent direct modification of the store
  return JSON.parse(JSON.stringify(events));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 50));
  const event = events.find((e) => e.id === id);
  return event ? JSON.parse(JSON.stringify(event)) : undefined;
}

export async function createEvent(newEventData: Omit<Event, 'id' | 'registeredSeats' | 'assignedVolunteers'>): Promise<Event> {
  // Simulate API delay and ID generation
  await new Promise((resolve) => setTimeout(resolve, 150));
  const newEvent: Event = {
    ...newEventData,
    id: `evt${Date.now()}`, // Simple ID generation
    registeredSeats: 0,
    assignedVolunteers: [], // Initialize as empty array
  };
  events.push(newEvent);
  console.log('Created new event:', newEvent);
  return JSON.parse(JSON.stringify(newEvent));
}

// --- Registration Functions ---

// Updated to accept optional documentUrl
export async function registerForEvent(
    eventId: string,
    userId: string,
    documentUrl?: string // Optional document URL
): Promise<{ success: boolean; message: string; registration?: Registration }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) {
    return { success: false, message: 'Event not found.' };
  }

  const event = events[eventIndex];
  if (event.registeredSeats >= event.totalSeats) {
    return { success: false, message: 'Event is full.' };
  }

  // Simple check for existing registration (replace with more robust logic)
  const existingRegistration = registrations.find(r => r.eventId === eventId && r.userId === userId);
  if (existingRegistration) {
     return { success: false, message: 'You are already registered for this event.' };
  }


  // Increment registered seats
  events[eventIndex] = { ...event, registeredSeats: event.registeredSeats + 1 };

  // Generate unique token
  const token = generateToken();

  // Create registration record
  const newRegistration: Registration = {
    id: `reg${Date.now()}`, // Simple ID generation
    eventId,
    userId,
    registrationDate: new Date().toISOString(),
    token,
    documentUrl, // Add the document URL if provided
  };
  registrations.push(newRegistration);

  console.log('Registered user for event:', newRegistration);
  console.log('Updated event seats:', events[eventIndex]);

  // Update supply (basic example - reduce one snack bar per registration)
  // In a real app, this would be more complex based on event needs
  try {
    // await updateSupplyQuantity('Snack Bars', -1); // TODO: Re-enable when supply service is implemented
    console.warn('Supply update skipped - updateSupplyQuantity commented out.');
  } catch (error) {
    console.error("Failed to update supply:", error);
    // Decide if registration should fail if supply update fails
  }


  return { success: true, message: 'Registration successful!', registration: JSON.parse(JSON.stringify(newRegistration)) };
}

export async function getRegistrationsForEvent(eventId: string): Promise<Registration[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(registrations.filter(r => r.eventId === eventId)));
}

// --- Volunteer Assignment ---
export async function assignVolunteerToEvent(eventId: string, volunteerId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: "Event not found." };
    }
    if (!events[eventIndex].assignedVolunteers) {
        events[eventIndex].assignedVolunteers = [];
    }
    if (!events[eventIndex].assignedVolunteers?.includes(volunteerId)) {
        events[eventIndex].assignedVolunteers?.push(volunteerId);
        console.log(`Assigned volunteer ${volunteerId} to event ${eventId}`);
        return { success: true, message: "Volunteer assigned successfully." };
    }
    return { success: false, message: "Volunteer already assigned to this event." };
}

export async function removeVolunteerFromEvent(eventId: string, volunteerId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: "Event not found." };
    }
    const volunteerIndex = events[eventIndex].assignedVolunteers?.indexOf(volunteerId);
    if (volunteerIndex !== undefined && volunteerIndex > -1) {
        events[eventIndex].assignedVolunteers?.splice(volunteerIndex, 1);
        console.log(`Removed volunteer ${volunteerId} from event ${eventId}`);
        return { success: true, message: "Volunteer removed successfully." };
    }
    return { success: false, message: "Volunteer not found in this event." };
}

// --- Event Cost/Sponsorship Update ---
export async function updateEventFinancials(eventId: string, financials: { estimatedCost?: number; sponsorshipAmount?: number }): Promise<{ success: boolean; message: string, event?: Event }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: "Event not found." };
    }
    if (financials.estimatedCost !== undefined) {
        events[eventIndex].estimatedCost = financials.estimatedCost;
    }
     if (financials.sponsorshipAmount !== undefined) {
        events[eventIndex].sponsorshipAmount = financials.sponsorshipAmount;
    }
    console.log(`Updated financials for event ${eventId}:`, events[eventIndex]);
    return { success: true, message: "Financials updated successfully.", event: JSON.parse(JSON.stringify(events[eventIndex])) };
}

// --- Add more mock data/functions as needed for other features ---
