
import type { Volunteer } from './volunteer'; // Import Volunteer type

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // Store date as ISO string or use Date object if preferred
  totalSeats: number;
  registeredSeats: number;
  roomAssignment: string;
  speaker: string;
  cost: number;
  sponsorship?: string; // Sponsor name/details (optional)
  estimatedCost?: number; // Estimated cost of the event (optional)
  sponsorshipAmount?: number; // Amount received from sponsor (optional)
  assignedVolunteers?: string[]; // Array of Volunteer IDs assigned to this event
  // imageUrl?: string; // Potential future addition
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string; // Assuming some user identification
  registrationDate: string; // ISO string
  token: string;
  documentUrl?: string; // Optional link to uploaded document
}
