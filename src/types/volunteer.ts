
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  assignedEventIds: string[]; // Events the volunteer is assigned to
  attendance: Record<string, boolean>; // Track attendance per eventId (e.g., { 'evt1': true })
  tasks?: Record<string, string>; // Track task per eventId (e.g., { 'evt1': 'Registration Desk' })
}
