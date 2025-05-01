
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { DailyMenu, MenuItem } from '@/types/canteen';
import { getDailyMenu, getAllMenuItems } from '@/lib/canteen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Utensils, AlertTriangle } from 'lucide-react';
import Image from 'next/image'; // Import next/image

interface MenuDisplayProps {
    initialDate?: Date;
    onItemSelected?: (item: MenuItem) => void; // Optional callback for item selection
}

export default function CanteenMenuDisplay({ initialDate = new Date(), onItemSelected }: MenuDisplayProps) {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [menu, setMenu] = useState<DailyMenu | null>(null);
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAllItems() {
            try {
                const items = await getAllMenuItems();
                setAllItems(items);
            } catch (err) {
                 console.error("Failed to load all menu items:", err);
                 // Non-critical error, menu display can still work
            }
        }
        fetchAllItems();
    }, []); // Fetch all items once on mount


    useEffect(() => {
        async function fetchMenu() {
            setIsLoading(true);
            setError(null);
            setMenu(null); // Clear previous menu
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            try {
                const dailyMenu = await getDailyMenu(dateString);
                setMenu(dailyMenu || null); // Set to null if undefined
            } catch (err) {
                console.error(`Failed to load menu for ${dateString}:`, err);
                setError("Failed to load the menu. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchMenu();
    }, [selectedDate]); // Refetch when date changes

    const handleDateChange = (daysToAdd: number) => {
        setSelectedDate(prevDate => addDays(prevDate, daysToAdd));
    };

    const getItemDetails = (itemId: string): MenuItem | undefined => {
        return allItems.find(item => item.id === itemId);
    };

    const renderMenuItems = (itemIds: string[], mealType: string) => {
        if (!itemIds || itemIds.length === 0) {
            return <p className="text-muted-foreground italic text-sm">No items listed for {mealType}.</p>;
        }

        return (
             <ul className="space-y-3">
                {itemIds.map(itemId => {
                    const item = getItemDetails(itemId);
                    if (!item) return null; // Skip if item details not found
                    return (
                        <li key={itemId} className="flex items-center justify-between border-b pb-2 last:border-0">
                             <div className="flex items-center gap-3">
                                 {item.imageUrl && (
                                      <Image
                                         src={item.imageUrl} // Assuming imageUrl is available
                                         alt={item.name}
                                         width={40}
                                         height={40}
                                         className="rounded-sm object-cover"
                                         data-ai-hint="food item" // Placeholder hint
                                      />
                                  )}
                                  {!item.imageUrl && <Utensils className="h-6 w-6 text-muted-foreground flex-shrink-0"/> } {/* Fallback Icon */}
                                 <div>
                                     <span className="font-medium">{item.name}</span>
                                     {!item.isVeg && <Badge variant="outline" className="ml-2 border-red-500 text-red-600 text-xs">Non-Veg</Badge>}
                                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                 </div>
                             </div>
                             <div className="text-right flex flex-col items-end gap-1">
                                <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</span>
                                {onItemSelected && (
                                     <Button size="sm" variant="outline" onClick={() => onItemSelected(item)}>
                                        Select {/* Or "Get Token" */}
                                     </Button>
                                )}
                            </div>

                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                     <span>Canteen Menu</span>
                     <Utensils className="h-6 w-6 text-primary"/>
                </CardTitle>
                <CardDescription>Menu for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardDescription>
                 {/* Date Navigation */}
                 <div className="flex items-center justify-center gap-4 pt-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)} aria-label="Previous day">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium text-lg">{format(selectedDate, 'dd MMM')}</span>
                    <Button variant="outline" size="icon" onClick={() => handleDateChange(1)} aria-label="Next day">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Loading menu...</span>
                    </div>
                ) : error ? (
                     <div className="text-center py-10 text-destructive flex flex-col items-center gap-2">
                         <AlertTriangle className="h-8 w-8"/>
                         <p>{error}</p>
                         <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button> {/* Simple retry */}
                    </div>
                ) : !menu ? (
                    <p className="text-center text-muted-foreground py-10">No menu available for this date.</p>
                ) : (
                    <Tabs defaultValue="breakfast" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                            <TabsTrigger value="lunch">Lunch</TabsTrigger>
                            <TabsTrigger value="dinner">Dinner</TabsTrigger>
                        </TabsList>
                        <TabsContent value="breakfast" className="mt-4">
                            {renderMenuItems(menu.breakfastItems, 'Breakfast')}
                        </TabsContent>
                        <TabsContent value="lunch" className="mt-4">
                             {renderMenuItems(menu.lunchItems, 'Lunch')}
                        </TabsContent>
                        <TabsContent value="dinner" className="mt-4">
                             {renderMenuItems(menu.dinnerItems, 'Dinner')}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}
