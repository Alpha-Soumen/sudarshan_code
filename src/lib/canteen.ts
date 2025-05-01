
import type { MenuItem, DailyMenu, FoodToken } from '@/types/canteen';
import { format } from 'date-fns'; // Using date-fns for date formatting

// Mock in-memory data stores
let menuItems: MenuItem[] = [
  { id: 'item1', name: 'Idli Sambar', price: 30, category: 'Breakfast', isVeg: true },
  { id: 'item2', name: 'Masala Dosa', price: 50, category: 'Breakfast', isVeg: true },
  { id: 'item3', name: 'Veg Thali', price: 80, category: 'Lunch', isVeg: true },
  { id: 'item4', name: 'Chicken Biryani', price: 120, category: 'Lunch', isVeg: false },
  { id: 'item5', name: 'Paneer Butter Masala', price: 90, category: 'Dinner', isVeg: true },
  { id: 'item6', name: 'Roti', price: 10, category: 'Dinner', isVeg: true },
  { id: 'item7', name: 'Tea', price: 15, category: 'Beverage', isVeg: true },
];

let dailyMenus: DailyMenu[] = [
  {
    id: 'menu_today',
    date: format(new Date(), 'yyyy-MM-dd'), // Today's date
    breakfastItems: ['item1', 'item2', 'item7'],
    lunchItems: ['item3', 'item4'],
    dinnerItems: ['item5', 'item6'],
  },
   {
    id: 'menu_tomorrow',
    date: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Tomorrow's date
    breakfastItems: ['item2', 'item7'],
    lunchItems: ['item3'],
    dinnerItems: ['item5', 'item6'],
  },
];

let foodTokens: FoodToken[] = [];

// --- Menu Functions ---

export async function getAllMenuItems(): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return JSON.parse(JSON.stringify(menuItems));
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const item = menuItems.find(i => i.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
}

export async function addMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Trim name before saving
    const trimmedName = itemData.name.trim();
    if (!trimmedName) {
        throw new Error("Menu item name cannot be empty.");
    }
    const newItem: MenuItem = { ...itemData, name: trimmedName, id: `item${Date.now()}` };
    menuItems.push(newItem);
    console.log("Added Menu Item:", newItem);
    return JSON.parse(JSON.stringify(newItem));
}

export async function getDailyMenu(date: string): Promise<DailyMenu | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const menu = dailyMenus.find(m => m.date === date);
   if (!menu) return undefined;

  // Optionally populate item details (or do this on the frontend)
  // const populatedMenu = { ...menu };
  // populatedMenu.breakfastItems = await Promise.all(menu.breakfastItems.map(id => getMenuItemById(id)));
  // ... etc. for lunch/dinner

  return menu ? JSON.parse(JSON.stringify(menu)) : undefined;
}

export async function setDailyMenu(menuData: Omit<DailyMenu, 'id'>): Promise<DailyMenu> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existingMenuIndex = dailyMenus.findIndex(m => m.date === menuData.date);
    let menu: DailyMenu;
    if (existingMenuIndex > -1) {
        // Update existing menu
        dailyMenus[existingMenuIndex] = { ...dailyMenus[existingMenuIndex], ...menuData };
        menu = dailyMenus[existingMenuIndex];
        console.log("Updated Daily Menu:", menu);
    } else {
        // Add new menu
        menu = { ...menuData, id: `menu${Date.now()}` };
        dailyMenus.push(menu);
        console.log("Set Daily Menu:", menu);
    }
    return JSON.parse(JSON.stringify(menu));
}


// --- Food Token Functions ---

export async function generateFoodToken(userId: string, menuItemId: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner', dateValid: string): Promise<{ success: boolean; message: string; token?: FoodToken }> {
  await new Promise((resolve) => setTimeout(resolve, 100));

   // Optional: Check if the item is actually on the menu for that day/mealtime
   const dailyMenu = await getDailyMenu(dateValid);
   if (!dailyMenu) {
       return { success: false, message: `No menu found for ${dateValid}.` };
   }
   const itemsForMeal = mealType === 'Breakfast' ? dailyMenu.breakfastItems : mealType === 'Lunch' ? dailyMenu.lunchItems : dailyMenu.dinnerItems;
   if (!itemsForMeal.includes(menuItemId)) {
       return { success: false, message: `Item not available for ${mealType} on ${dateValid}.` };
   }

  // Optional: Add checks for daily token limits per user if needed

  const newToken: FoodToken = {
    id: `tkn${Date.now()}${Math.random().toString(16).substring(2, 8)}`, // More unique ID
    userId,
    menuItemId,
    dateGenerated: new Date().toISOString(),
    dateValid,
    mealType,
    isValidated: false,
  };
  foodTokens.push(newToken);
  console.log('Generated Food Token:', newToken);
  return { success: true, message: 'Token generated successfully.', token: JSON.parse(JSON.stringify(newToken)) };
}

export async function validateFoodToken(tokenId: string): Promise<{ success: boolean; message: string; token?: FoodToken }> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const trimmedTokenId = tokenId.trim(); // Trim token ID
  const tokenIndex = foodTokens.findIndex(t => t.id === trimmedTokenId);

  if (tokenIndex === -1) {
    return { success: false, message: 'Token not found.' };
  }

  const token = foodTokens[tokenIndex];

   // Check if token is for today (or allow past tokens based on rules)
   const today = format(new Date(), 'yyyy-MM-dd');
   if (token.dateValid !== today) {
        return { success: false, message: `Token is only valid for ${token.dateValid}.`, token: JSON.parse(JSON.stringify(token)) };
   }


  if (token.isValidated) {
    return { success: false, message: `Token already validated on ${new Date(token.validationTimestamp!).toLocaleString()}.`, token: JSON.parse(JSON.stringify(token)) };
  }

  // Mark as validated
  foodTokens[tokenIndex].isValidated = true;
  foodTokens[tokenIndex].validationTimestamp = new Date().toISOString();
  console.log('Validated Food Token:', foodTokens[tokenIndex]);

  return { success: true, message: 'Token validated successfully.', token: JSON.parse(JSON.stringify(foodTokens[tokenIndex])) };
}


export async function getUserTokens(userId: string, date?: string): Promise<FoodToken[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    let userTokens = foodTokens.filter(t => t.userId === userId);
    if (date) {
        userTokens = userTokens.filter(t => t.dateValid === date);
    }
    return JSON.parse(JSON.stringify(userTokens));
}
