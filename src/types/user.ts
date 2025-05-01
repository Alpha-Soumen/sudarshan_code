
// Define possible user roles
export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  EventManager = 'EventManager',
  FinanceAdmin = 'FinanceAdmin',
  Student = 'Student',
  Volunteer = 'Volunteer', // Added volunteer role
}

// Define the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Add other relevant user properties as needed
}

// Mock current user (replace with actual authentication context)
export const MOCK_CURRENT_USER: User = {
  id: 'user-super-admin-01',
  name: 'Super Admin User',
  email: 'super@edu.event.hub',
  role: UserRole.SuperAdmin, // Change this to test different roles
};

// Helper function to check role access (replace with actual auth logic)
export function hasPermission(
  currentUser: User | null,
  requiredRoles: UserRole[]
): boolean {
  if (!currentUser) {
    return false; // No user logged in
  }
  return requiredRoles.includes(currentUser.role);
}
