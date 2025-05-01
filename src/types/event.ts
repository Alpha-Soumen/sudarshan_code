
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
  sponsorship?: string; // Optional field
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string; // Assuming some user identification
  registrationDate: string; // ISO string
  token: string;
}
