
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import CanteenMenuDisplay from './menu-display'; // Import the menu display
import type { MenuItem, FoodToken } from '@/types/canteen';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER } from '@/types/user'; // Use mock user
import { generateFoodToken, getUserTokens, getMenuItemById } from '@/lib/canteen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, List, Check, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TokenSystemProps {
    // Props if needed
}

interface EnrichedToken extends FoodToken {
    itemName?: string; // Add item name for display
}


export default function CanteenTokenSystem({}: TokenSystemProps) {
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [myTokens, setMyTokens] = useState<EnrichedToken[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const currentUser = MOCK_CURRENT_USER; // Replace with real auth
    const isStudent = currentUser?.role === UserRole.Student || currentUser?.role === UserRole.SuperAdmin; // Allow admin for testing

    useEffect(() => {
        async function fetchTokens() {
            if (!currentUser?.id || !isStudent) return;
            setIsLoadingTokens(true);
            try {
                const tokens = await getUserTokens(currentUser.id);
                // Enrich tokens with item names
                const enriched = await Promise.all(tokens.map(async (token) => {
                     const item = await getMenuItemById(token.menuItemId);
                     return { ...token, itemName: item?.name || 'Unknown Item' };
                }));
                setMyTokens(enriched);
            } catch (err) {
                console.error("Failed to load user tokens:", err);
                toast({ title: "Error", description: "Could not load your food tokens.", variant: "destructive" });
            } finally {
                setIsLoadingTokens(false);
            }
        }
        fetchTokens();
    }, [currentUser?.id, isStudent, toast]); // Re-fetch if user changes or after generation (implicitly via state update)

    const handleGenerateToken = async () => {
        if (!selectedItem || !currentUser?.id) return;

        setIsGenerating(true);
        // Determine Meal Type based on current time (simple example)
        const hour = new Date().getHours();
        let mealType: 'Breakfast' | 'Lunch' | 'Dinner' = 'Lunch'; // Default
        if (hour < 10) mealType = 'Breakfast';
        else if (hour >= 16) mealType = 'Dinner';

        const dateValid = format(new Date(), 'yyyy-MM-dd'); // Token for today

        try {
            const result = await generateFoodToken(currentUser.id, selectedItem.id, mealType, dateValid);
            if (result.success && result.token) {
                toast({ title: "Token Generated!", description: `Token for ${selectedItem.name} created successfully.` });
                // Enrich and add the new token locally
                 const enrichedToken: EnrichedToken = { ...result.token, itemName: selectedItem.name };
                setMyTokens(prev => [enrichedToken, ...prev]); // Add to the top
                setSelectedItem(null); // Clear selection
            } else {
                toast({ title: "Generation Failed", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            console.error("Failed to generate token:", err);
            toast({ title: "Error", description: "Could not generate token.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isStudent) {
        return (
             <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                 <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                     <CardHeader className="items-center">
                         <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-muted-foreground">
                            Only students can generate food tokens.
                         </p>
                     </CardContent>
                 </Card>
             </div>
        );
    }


    return (
        <div className="container mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Display & Selection */}
            <div className="lg:col-span-2">
                <CanteenMenuDisplay onItemSelected={setSelectedItem} />

                {selectedItem && (
                    <Card className="mt-6 shadow-md border border-accent">
                        <CardHeader>
                            <CardTitle className="text-lg">Confirm Token Generation</CardTitle>
                            <CardDescription>Generate a token for the selected item for today's relevant meal.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-4">
                             <div>
                                <p>Selected Item: <span className="font-semibold">{selectedItem.name}</span></p>
                                <p>Price: <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedItem.price)}</span></p>
                                <p className="text-xs text-muted-foreground mt-1">Token will be valid for today ({format(new Date(), 'yyyy-MM-dd')}).</p>
                             </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                                    Generate Token
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Generation?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will generate a non-refundable food token for "{selectedItem.name}" for today. Ensure you have sufficient balance (if applicable).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleGenerateToken} disabled={isGenerating}>
                                      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                      Confirm & Generate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                        </CardContent>
                    </Card>
                )}
            </div>

            {/* My Tokens */}
            <div className="lg:col-span-1">
                <Card className="shadow-md border sticky top-8"> {/* Make it sticky */}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><List /> My Food Tokens</CardTitle>
                        <CardDescription>Your generated tokens for today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingTokens ? (
                            <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/></div>
                        ) : myTokens.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">You have no tokens for today yet. Select an item from the menu to generate one.</p>
                        ) : (
                            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"> {/* Scrollable list */}
                                {myTokens
                                    .filter(token => token.dateValid === format(new Date(), 'yyyy-MM-dd')) // Filter for today
                                    .sort((a, b) => new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime()) // Sort newest first
                                    .map(token => (
                                    <li key={token.id} className="border rounded-md p-3 bg-card">
                                         <div className="flex justify-between items-start">
                                             <span className="font-semibold">{token.itemName}</span>
                                             <Badge variant={token.isValidated ? "default" : "secondary"}>
                                                {token.isValidated ? <Check className="mr-1 h-3 w-3"/> : <X className="mr-1 h-3 w-3"/>}
                                                {token.isValidated ? 'Validated' : 'Not Validated'}
                                             </Badge>
                                         </div>
                                         <p className="text-sm text-muted-foreground">{token.mealType}</p>
                                         <p className="text-xs text-muted-foreground mt-1">Token ID: {token.id.substring(0, 12)}...</p>
                                         <p className="text-xs text-muted-foreground">Generated: {new Date(token.dateGenerated).toLocaleTimeString()}</p>
                                         {token.isValidated && token.validationTimestamp && (
                                            <p className="text-xs text-green-600">Validated at: {new Date(token.validationTimestamp).toLocaleTimeString()}</p>
                                         )}
                                    </li>
                                ))}
                                {myTokens.filter(token => token.dateValid === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
                                     <p className="text-muted-foreground text-center py-4">No tokens generated for today yet.</p>
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
