
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { MenuItem, DailyMenu, FoodToken } from '@/types/canteen';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user';
import { getAllMenuItems, addMenuItem, setDailyMenu, validateFoodToken, getDailyMenu } from '@/lib/canteen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Utensils, CalendarPlus, ScanLine, Check, X } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Import Badge

interface CanteenAdminProps {
    // Props, if any
}

export default function CanteenAdminPanel({}: CanteenAdminProps) {
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [dailyMenuData, setDailyMenuData] = useState<Partial<DailyMenu>>({}); // For editing
    const [menuForSelectedDate, setMenuForSelectedDate] = useState<DailyMenu | null>(null); // Display existing
    const [tokenToValidate, setTokenToValidate] = useState<string>('');
    const [validationResult, setValidationResult] = useState<{ success: boolean; message: string; token?: FoodToken } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingMenu, setIsSubmittingMenu] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const currentUser = MOCK_CURRENT_USER; // Replace with real auth
     // Define roles that can manage canteen (e.g., SuperAdmin or a specific CanteenAdmin role)
    const canManageCanteen = hasPermission(currentUser, [UserRole.SuperAdmin]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const items = await getAllMenuItems();
                setAllItems(items);
                await fetchMenuForDate(selectedDate || new Date()); // Fetch menu for initial date
            } catch (err) {
                console.error("Failed to load initial canteen data:", err);
                setError("Failed to load menu items.");
            } finally {
                setIsLoading(false);
            }
        }
         if (canManageCanteen) {
            fetchData();
        }
    }, [canManageCanteen]);// Run only once or if permissions change

     const fetchMenuForDate = async (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        try {
            const existingMenu = await getDailyMenu(dateString);
            setMenuForSelectedDate(existingMenu || null);
            // Pre-fill editing state if menu exists, otherwise reset
             setDailyMenuData(existingMenu ? { ...existingMenu } : { date: dateString, breakfastItems: [], lunchItems: [], dinnerItems: [] });
        } catch (err) {
             console.error(`Failed to load menu for ${dateString}:`, err);
             toast({title: "Error", description: `Could not fetch menu for ${format(date, 'PPP')}.`, variant: "destructive"});
             setMenuForSelectedDate(null);
             setDailyMenuData({ date: dateString, breakfastItems: [], lunchItems: [], dinnerItems: [] }); // Reset editor
        }
    };

     // Fetch menu when selectedDate changes
     useEffect(() => {
        if (selectedDate) {
            fetchMenuForDate(selectedDate);
        }
    }, [selectedDate]);


    const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmittingMenu(true); // Reuse submitting state or add a new one
        const formData = new FormData(e.currentTarget);
        const newItemData: Omit<MenuItem, 'id'> = {
            name: formData.get('itemName') as string,
            price: parseFloat(formData.get('itemPrice') as string),
            category: formData.get('itemCategory') as MenuItem['category'],
            isVeg: formData.get('itemIsVeg') === 'on',
            description: formData.get('itemDescription') as string || undefined,
            imageUrl: formData.get('itemImageUrl') as string || undefined,
        };

         if (!newItemData.name || isNaN(newItemData.price) || !newItemData.category) {
             toast({ title: "Missing Fields", description: "Please fill in Item Name, Price, and Category.", variant: "destructive"});
             setIsSubmittingMenu(false);
             return;
         }

        try {
            const addedItem = await addMenuItem(newItemData);
            toast({ title: "Item Added", description: `${addedItem.name} added to the menu items list.` });
            setAllItems(prev => [...prev, addedItem]);
            e.currentTarget.reset(); // Reset form
        } catch (err) {
            console.error("Failed to add menu item:", err);
            toast({ title: "Error", description: "Could not add menu item.", variant: "destructive" });
        } finally {
             setIsSubmittingMenu(false);
        }
    };

     const handleDailyMenuSave = async () => {
        if (!selectedDate) {
            toast({ title: "No Date Selected", description: "Please select a date for the menu.", variant: "destructive" });
            return;
        }
        setIsSubmittingMenu(true);
        const menuToSave: Omit<DailyMenu, 'id'> = {
            date: format(selectedDate, 'yyyy-MM-dd'),
            breakfastItems: dailyMenuData.breakfastItems || [],
            lunchItems: dailyMenuData.lunchItems || [],
            dinnerItems: dailyMenuData.dinnerItems || [],
        };

        try {
            const savedMenu = await setDailyMenu(menuToSave);
            toast({ title: "Menu Saved", description: `Menu for ${format(selectedDate, 'PPP')} has been saved.` });
            setMenuForSelectedDate(savedMenu); // Update displayed menu
            setDailyMenuData(savedMenu); // Update editor state
        } catch (err) {
            console.error("Failed to save daily menu:", err);
            toast({ title: "Error", description: "Could not save the daily menu.", variant: "destructive" });
        } finally {
             setIsSubmittingMenu(false);
        }
    };


    const handleValidateToken = async () => {
        if (!tokenToValidate.trim()) {
            toast({ title: "No Token ID", description: "Please enter a Token ID to validate.", variant: "destructive" });
            return;
        }
        setIsValidating(true);
        setValidationResult(null); // Clear previous result
        try {
            const result = await validateFoodToken(tokenToValidate.trim());
            setValidationResult(result);
             if (result.success) {
                 toast({ title: "Validation Successful", description: `Token ${result.token?.id.substring(0, 8)}... validated.` });
             } else {
                 toast({ title: "Validation Failed", description: result.message, variant: "destructive" });
             }
        } catch (err) {
            console.error("Failed to validate token:", err);
            setValidationResult({ success: false, message: "An error occurred during validation." });
            toast({ title: "Error", description: "Could not validate token.", variant: "destructive" });
        } finally {
            setIsValidating(false);
             setTokenToValidate(''); // Clear input after attempt
        }
    };

     const handleItemSelectionChange = (mealType: keyof DailyMenu, itemId: string, isSelected: boolean) => {
        setDailyMenuData(prevData => {
            const currentItems = prevData[mealType] || [];
            let newItems;
            if (isSelected) {
                newItems = [...currentItems, itemId];
            } else {
                newItems = currentItems.filter(id => id !== itemId);
            }
            return { ...prevData, [mealType]: newItems };
        });
    };


    if (!canManageCanteen) {
        return (
            <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                     <CardHeader className="items-center">
                         <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-muted-foreground">
                            You do not have permission to manage the canteen.
                         </p>
                     </CardContent>
                 </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
             <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-primary">Canteen Admin Panel</h1>
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading Canteen Data...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="container mx-auto py-8 px-4">
             <h1 className="text-3xl font-bold mb-6 text-primary">Canteen Admin Panel</h1>

             <Tabs defaultValue="manage_menu" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="manage_menu"><CalendarPlus className="mr-2 h-4 w-4"/>Manage Daily Menu</TabsTrigger>
                    <TabsTrigger value="add_item"><Utensils className="mr-2 h-4 w-4"/>Add Menu Item</TabsTrigger>
                    <TabsTrigger value="validate_token"><ScanLine className="mr-2 h-4 w-4"/>Validate Token</TabsTrigger>
                </TabsList>

                {/* Manage Daily Menu Tab */}
                <TabsContent value="manage_menu">
                    <Card className="shadow-md border">
                        <CardHeader>
                             <CardTitle>Set Daily Menu</CardTitle>
                             <CardDescription>Select a date and choose items for breakfast, lunch, and dinner.</CardDescription>
                             {/* Date Picker */}
                              <div className="pt-4">
                                 <Label htmlFor="menu-date">Select Menu Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="menu-date"
                                            variant={"outline"}
                                            className="w-[280px] justify-start text-left font-normal mt-1"
                                        >
                                            {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                setSelectedDate(date);
                                                // fetchMenuForDate will be triggered by useEffect
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                             </div>
                        </CardHeader>
                        <CardContent>
                            {error && <p className="text-destructive mb-4">{error}</p>}
                            {!selectedDate ? (
                                 <p className="text-muted-foreground">Please select a date.</p>
                             ) : (
                                <div className="space-y-6">
                                    {/* Breakfast Selection */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Breakfast Items</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                             {allItems.filter(i => i.category === 'Breakfast' || i.category === 'Beverage').map(item => (
                                                <div key={item.id} className="flex items-center space-x-2 border p-2 rounded-md">
                                                    <Checkbox
                                                         id={`bf-${item.id}`}
                                                         checked={dailyMenuData.breakfastItems?.includes(item.id)}
                                                         onCheckedChange={(checked) => handleItemSelectionChange('breakfastItems', item.id, Boolean(checked))}
                                                    />
                                                    <label htmlFor={`bf-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        {item.name}
                                                    </label>
                                                </div>
                                             ))}
                                         </div>
                                    </div>
                                     {/* Lunch Selection */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Lunch Items</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                             {allItems.filter(i => i.category === 'Lunch' || i.category === 'Snacks' || i.category === 'Beverage').map(item => (
                                                <div key={item.id} className="flex items-center space-x-2 border p-2 rounded-md">
                                                    <Checkbox
                                                         id={`ln-${item.id}`}
                                                         checked={dailyMenuData.lunchItems?.includes(item.id)}
                                                         onCheckedChange={(checked) => handleItemSelectionChange('lunchItems', item.id, Boolean(checked))}
                                                    />
                                                     <label htmlFor={`ln-${item.id}`} className="text-sm font-medium leading-none">
                                                         {item.name} {!item.isVeg && <Badge variant="outline" className="ml-1 border-red-500 text-red-600 text-xs">NV</Badge>}
                                                     </label>
                                                 </div>
                                             ))}
                                         </div>
                                    </div>
                                     {/* Dinner Selection */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Dinner Items</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                             {allItems.filter(i => i.category === 'Dinner' || i.category === 'Snacks' || i.category === 'Beverage').map(item => (
                                                <div key={item.id} className="flex items-center space-x-2 border p-2 rounded-md">
                                                    <Checkbox
                                                         id={`dn-${item.id}`}
                                                         checked={dailyMenuData.dinnerItems?.includes(item.id)}
                                                         onCheckedChange={(checked) => handleItemSelectionChange('dinnerItems', item.id, Boolean(checked))}
                                                    />
                                                    <label htmlFor={`dn-${item.id}`} className="text-sm font-medium leading-none">
                                                         {item.name} {!item.isVeg && <Badge variant="outline" className="ml-1 border-red-500 text-red-600 text-xs">NV</Badge>}
                                                    </label>
                                                </div>
                                             ))}
                                         </div>
                                    </div>

                                     <Button onClick={handleDailyMenuSave} disabled={isSubmittingMenu}>
                                        {isSubmittingMenu ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Menu for {format(selectedDate, 'PPP')}
                                    </Button>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Add Menu Item Tab */}
                <TabsContent value="add_item">
                     <Card className="shadow-md border max-w-lg mx-auto">
                        <CardHeader>
                            <CardTitle>Add New Menu Item</CardTitle>
                            <CardDescription>Add a reusable item to the master list.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleAddItem} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="itemName">Item Name*</Label>
                                        <Input id="itemName" name="itemName" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="itemPrice">Price (INR)*</Label>
                                        <Input id="itemPrice" name="itemPrice" type="number" step="0.01" min="0" required />
                                    </div>
                                 </div>
                                  <div className="space-y-1">
                                     <Label htmlFor="itemCategory">Category*</Label>
                                     <Select name="itemCategory" required>
                                        <SelectTrigger id="itemCategory">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Breakfast">Breakfast</SelectItem>
                                            <SelectItem value="Lunch">Lunch</SelectItem>
                                            <SelectItem value="Dinner">Dinner</SelectItem>
                                            <SelectItem value="Snacks">Snacks</SelectItem>
                                            <SelectItem value="Beverage">Beverage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="space-y-1">
                                     <Label htmlFor="itemDescription">Description (Optional)</Label>
                                     <Textarea id="itemDescription" name="itemDescription" rows={2} />
                                 </div>
                                 <div className="space-y-1">
                                     <Label htmlFor="itemImageUrl">Image URL (Optional)</Label>
                                     <Input id="itemImageUrl" name="itemImageUrl" placeholder="https://..."/>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox id="itemIsVeg" name="itemIsVeg" />
                                    <Label htmlFor="itemIsVeg">Vegetarian?</Label>
                                </div>
                                 <Button type="submit" disabled={isSubmittingMenu}>
                                     {isSubmittingMenu ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                     Add Item to List
                                 </Button>
                             </form>
                         </CardContent>
                     </Card>
                 </TabsContent>

                {/* Validate Token Tab */}
                <TabsContent value="validate_token">
                     <Card className="shadow-md border max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Validate Food Token</CardTitle>
                            <CardDescription>Enter the token ID to validate it for today's meal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Enter Token ID..."
                                    value={tokenToValidate}
                                    onChange={(e) => setTokenToValidate(e.target.value)}
                                    aria-label="Token ID input"
                                />
                                <Button onClick={handleValidateToken} disabled={isValidating || !tokenToValidate.trim()}>
                                    {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Validate
                                </Button>
                            </div>
                             {validationResult && (
                                <div className={`mt-4 p-3 rounded-md border ${validationResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                    <h4 className="font-semibold flex items-center gap-1">
                                         {validationResult.success ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                                         Validation {validationResult.success ? 'Successful' : 'Failed'}
                                    </h4>
                                    <p className="text-sm">{validationResult.message}</p>
                                    {validationResult.token && (
                                         <div className="text-xs mt-1">
                                            <p>Item: {allItems.find(i => i.id === validationResult.token!.menuItemId)?.name || 'Unknown'}</p>
                                            <p>User ID: {validationResult.token.userId}</p>
                                            <p>Valid For: {validationResult.token.dateValid} ({validationResult.token.mealType})</p>
                                        </div>
                                    )}
                                </div>
                            )}
                         </CardContent>
                     </Card>
                 </TabsContent>

             </Tabs>
        </div>
    );
}
