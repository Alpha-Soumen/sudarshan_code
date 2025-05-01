
export enum RequestStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  block: string;
  capacity: number;
  occupants: string[]; // User IDs
}

export interface RoomRequest {
  id: string;
  userId: string; // ID of the student making the request
  requestType: 'Change' | 'Maintenance';
  currentRoomId?: string; // Relevant for change requests
  preferredRoomId?: string; // Relevant for change requests
  description: string; // Details of maintenance or reason for change
  status: RequestStatus;
  submittedDate: string; // ISO string
  resolvedDate?: string; // ISO string
  adminNotes?: string;
}

export interface Complaint {
  id: string;
  userId: string; // ID of the student making the complaint
  roomId?: string; // Optional: Room related to the complaint
  category: string; // e.g., Noise, Cleanliness, Safety
  description: string;
  status: RequestStatus;
  submittedDate: string; // ISO string
  resolvedDate?: string; // ISO string
  adminNotes?: string;
}
