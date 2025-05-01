
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Beverage';
  isVeg: boolean;
  imageUrl?: string; // Optional image
}

export interface DailyMenu {
  id: string;
  date: string; // Date for which this menu is valid (e.g., 'YYYY-MM-DD')
  breakfastItems: string[]; // Array of MenuItem IDs
  lunchItems: string[]; // Array of MenuItem IDs
  dinnerItems: string[]; // Array of MenuItem IDs
}

export interface FoodToken {
  id: string; // Unique token identifier
  userId: string; // User who generated the token
  menuItemId: string; // The specific item this token is for
  dateGenerated: string; // ISO string
  dateValid: string; // Date for which the token is valid (e.g., 'YYYY-MM-DD')
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  isValidated: boolean;
  validationTimestamp?: string; // ISO string
}
