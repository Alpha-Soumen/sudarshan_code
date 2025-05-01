
import type { HostelRoom, RoomRequest, Complaint } from '@/types/hostel';
import { RequestStatus } from '@/types/hostel';

// Mock in-memory data stores
let hostelRooms: HostelRoom[] = [
  { id: 'room101', roomNumber: '101', block: 'A', capacity: 2, occupants: ['student1'] },
  { id: 'room102', roomNumber: '102', block: 'A', capacity: 2, occupants: ['student2', 'student3'] },
  { id: 'room201', roomNumber: '201', block: 'B', capacity: 1, occupants: ['student4'] },
];

let roomRequests: RoomRequest[] = [
  {
    id: 'req1',
    userId: 'student1',
    requestType: 'Maintenance',
    currentRoomId: 'room101',
    description: 'Leaking faucet in the bathroom.',
    status: RequestStatus.Pending,
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'req2',
    userId: 'student3',
    requestType: 'Change',
    currentRoomId: 'room102',
    preferredRoomId: 'room201', // Prefers single room
    description: 'Need a single room for better study focus.',
    status: RequestStatus.InProgress,
    submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    adminNotes: 'Checking availability of single rooms.',
  },
];

let complaints: Complaint[] = [
    {
        id: 'comp1',
        userId: 'student2',
        roomId: 'room102',
        category: 'Noise',
        description: 'Loud music late at night from adjacent room.',
        status: RequestStatus.Resolved,
        submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        adminNotes: 'Spoke with occupants of the adjacent room. Issue resolved.'
    }
];

// --- Hostel Room Functions ---

export async function getHostelRooms(): Promise<HostelRoom[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(hostelRooms));
}

export async function getHostelRoomById(id: string): Promise<HostelRoom | undefined> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const room = hostelRooms.find(r => r.id === id);
    return room ? JSON.parse(JSON.stringify(room)) : undefined;
}

// --- Room Request Functions ---

export async function getRoomRequests(statusFilter?: RequestStatus): Promise<RoomRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  let filteredRequests = roomRequests;
  if (statusFilter) {
    filteredRequests = roomRequests.filter(req => req.status === statusFilter);
  }
  return JSON.parse(JSON.stringify(filteredRequests));
}

export async function createRoomRequest(requestData: Omit<RoomRequest, 'id' | 'status' | 'submittedDate'>): Promise<RoomRequest> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newRequest: RoomRequest = {
        ...requestData,
        id: `req${Date.now()}`,
        status: RequestStatus.Pending,
        submittedDate: new Date().toISOString(),
    };
    roomRequests.push(newRequest);
    console.log("Created Room Request:", newRequest);
    return JSON.parse(JSON.stringify(newRequest));
}

export async function updateRoomRequestStatus(requestId: string, status: RequestStatus, adminNotes?: string): Promise<{ success: boolean; message: string; request?: RoomRequest }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const requestIndex = roomRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
        return { success: false, message: "Request not found." };
    }
    roomRequests[requestIndex].status = status;
    if (adminNotes) {
        roomRequests[requestIndex].adminNotes = adminNotes;
    }
    if (status === RequestStatus.Resolved || status === RequestStatus.Rejected) {
        roomRequests[requestIndex].resolvedDate = new Date().toISOString();
    }
    console.log(`Updated Room Request ${requestId} status to ${status}`);
    return { success: true, message: "Status updated.", request: JSON.parse(JSON.stringify(roomRequests[requestIndex])) };
}

// --- Complaint Functions ---

export async function getComplaints(statusFilter?: RequestStatus): Promise<Complaint[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
   let filteredComplaints = complaints;
   if (statusFilter) {
     filteredComplaints = complaints.filter(c => c.status === statusFilter);
   }
  return JSON.parse(JSON.stringify(filteredComplaints));
}

export async function createComplaint(complaintData: Omit<Complaint, 'id' | 'status' | 'submittedDate'>): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newComplaint: Complaint = {
        ...complaintData,
        id: `comp${Date.now()}`,
        status: RequestStatus.Pending,
        submittedDate: new Date().toISOString(),
    };
    complaints.push(newComplaint);
    console.log("Created Complaint:", newComplaint);
    return JSON.parse(JSON.stringify(newComplaint));
}

export async function updateComplaintStatus(complaintId: string, status: RequestStatus, adminNotes?: string): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const complaintIndex = complaints.findIndex(c => c.id === complaintId);
    if (complaintIndex === -1) {
        return { success: false, message: "Complaint not found." };
    }
    complaints[complaintIndex].status = status;
    if (adminNotes) {
        complaints[complaintIndex].adminNotes = adminNotes;
    }
     if (status === RequestStatus.Resolved || status === RequestStatus.Rejected) {
        complaints[complaintIndex].resolvedDate = new Date().toISOString();
    }
    console.log(`Updated Complaint ${complaintId} status to ${status}`);
    return { success: true, message: "Status updated.", complaint: JSON.parse(JSON.stringify(complaints[complaintIndex])) };
}
