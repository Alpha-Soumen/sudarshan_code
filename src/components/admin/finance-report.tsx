
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { FinancialSummary } from '@/lib/finance';
import type { Event } from '@/types/event';
import type { User } from '@/types/user';
import { UserRole, MOCK_CURRENT_USER, hasPermission } from '@/types/user';
import { getEvents, updateEventFinancials } from '@/lib/events';
import { generateFinancialReport } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Edit, Save, Ban, DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FinanceReportProps {
    // Props, if any
}

interface EditingFinancials {
    eventId: string;
    estimatedCost: string; // Store as string during edit
    sponsorshipAmount: string; // Store as string during edit
}

export default function FinanceReportPanel({}: FinanceReportProps) {
    const [report, setReport] = useState<FinancialSummary | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingFinancials, setEditingFinancials] = useState<EditingFinancials | null>(null);
    const { toast } = useToast();

    // Get current user (replace with actual auth context)
    const currentUser = MOCK_CURRENT_USER; // Use the mock user for now
    const canViewFinance = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.FinanceAdmin]);
    const canEditFinance = hasPermission(currentUser, [UserRole.SuperAdmin, UserRole.FinanceAdmin]); // In this case, same roles can edit

    useEffect(() => {
        async function fetchDataAndGenerateReport() {
            setIsLoading(true);
            setError(null);
            try {
                const eventsData = await getEvents();
                setEvents(eventsData); // Store raw events for editing
                const generatedReport = await generateFinancialReport(eventsData);
                setReport(generatedReport);
            } catch (err) {
                console.error("Failed to load financial data or generate report:", err);
                setError("Failed to load financial data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        if (canViewFinance) {
            fetchDataAndGenerateReport();
        }
    }, [canViewFinance]); // Re-run if user/permissions change

    const startEditing = (eventId: string) => {
        const eventData = report?.events.find(e => e.eventId === eventId);
        if (eventData) {
            setEditingFinancials({
                eventId: eventId,
                estimatedCost: eventData.estimatedCost.toString(),
                sponsorshipAmount: eventData.sponsorshipAmount.toString(),
            });
        }
    };

    const cancelEditing = () => {
        setEditingFinancials(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingFinancials) {
            setEditingFinancials({
                ...editingFinancials,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSaveFinancials = async () => {
        if (!editingFinancials) return;

        const { eventId, estimatedCost, sponsorshipAmount } = editingFinancials;
        const costNum = parseFloat(estimatedCost);
        const sponsorNum = parseFloat(sponsorshipAmount);

        if (isNaN(costNum) || costNum < 0 || isNaN(sponsorNum) || sponsorNum < 0) {
            toast({ title: "Invalid Input", description: "Please enter valid non-negative numbers for costs and sponsorship.", variant: "destructive" });
            return;
        }

        try {
             // Update backend
            const result = await updateEventFinancials(eventId, { estimatedCost: costNum, sponsorshipAmount: sponsorNum });

            if (result.success && result.event) {
                toast({ title: "Financials Updated", description: `Details for ${result.event.name} saved.` });

                // Update local state (report and events array) immediately for better UX
                setReport(prevReport => {
                    if (!prevReport) return null;
                    return {
                        ...prevReport,
                        events: prevReport.events.map(e =>
                            e.eventId === eventId ? { ...e, estimatedCost: costNum, sponsorshipAmount: sponsorNum, net: sponsorNum - costNum } : e
                        ),
                        // Recalculate totals (important!)
                        totalEstimatedCost: prevReport.events.reduce((sum, e) => sum + (e.eventId === eventId ? costNum : e.estimatedCost), 0),
                        totalSponsorshipReceived: prevReport.events.reduce((sum, e) => sum + (e.eventId === eventId ? sponsorNum : e.sponsorshipAmount), 0),
                        netPosition: prevReport.events.reduce((sum, e) => sum + (e.eventId === eventId ? sponsorNum - costNum : e.net), 0),
                    };
                });
                 setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? result.event! : e)); // Update base events array too

                setEditingFinancials(null); // Exit editing mode
            } else {
                toast({ title: "Update Failed", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            console.error("Failed to save financials:", err);
            toast({ title: "Error", description: "Could not save financial details.", variant: "destructive" });
        }
    };

     const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };


     if (!canViewFinance) {
         return (
             <div className="container mx-auto py-8 px-4 flex items-center justify-center text-center">
                 <Card className="max-w-md p-6 border-destructive bg-destructive/10">
                     <CardHeader className="items-center">
                         <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                         <CardTitle className="text-destructive text-2xl">Access Denied</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-muted-foreground">
                             You do not have permission to view financial reports. Please contact a Super Admin or Finance Admin.
                         </p>
                     </CardContent>
                 </Card>
             </div>
         );
     }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Finance Report</h2>
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Generating Report...</span>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h2 className="text-2xl font-semibold mb-4 text-destructive">Error</h2>
                <p className="text-destructive">{error || "Could not generate the financial report."}</p>
            </div>
        );
    }

    const overallNet = report.netPosition;
    const overallStatus = overallNet >= 0 ? 'Profit' : 'Loss';
    const overallColor = overallNet >= 0 ? 'text-green-600' : 'text-destructive';


    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2"><FileText/>Finance Summary</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                 <Card className="shadow border bg-card text-card-foreground">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Total Sponsorship</CardTitle>
                         <DollarSign className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{formatCurrency(report.totalSponsorshipReceived)}</div>
                     </CardContent>
                 </Card>
                 <Card className="shadow border bg-card text-card-foreground">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Total Estimated Cost</CardTitle>
                         <DollarSign className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{formatCurrency(report.totalEstimatedCost)}</div>
                     </CardContent>
                 </Card>
                 <Card className={cn("shadow border", overallNet >= 0 ? "border-green-500 bg-green-50" : "border-destructive bg-red-50")}>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Overall Net Position</CardTitle>
                         {overallNet >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                     </CardHeader>
                     <CardContent>
                         <div className={cn("text-2xl font-bold", overallColor)}>{formatCurrency(overallNet)}</div>
                         <p className={cn("text-xs", overallColor)}>
                             {overallStatus}
                         </p>
                     </CardContent>
                 </Card>
             </div>


            {/* Detailed Event Breakdown */}
            <Card className="shadow-md border">
                <CardHeader>
                    <CardTitle>Event Financial Breakdown</CardTitle>
                    <CardDescription>Detailed costs and sponsorship for each event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event Name</TableHead>
                                    <TableHead className="text-right">Estimated Cost</TableHead>
                                    <TableHead className="text-right">Sponsorship</TableHead>
                                    <TableHead className="text-right">Net</TableHead>
                                     {canEditFinance && <TableHead className="text-center">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.events.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canEditFinance ? 5 : 4} className="text-center text-muted-foreground py-10">
                                            No events with financial data found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    report.events.map((event) => (
                                        <TableRow key={event.eventId}>
                                            <TableCell className="font-medium">{event.eventName}</TableCell>
                                            <TableCell className="text-right">
                                                {editingFinancials?.eventId === event.eventId ? (
                                                    <Input
                                                        type="number"
                                                        name="estimatedCost"
                                                        value={editingFinancials.estimatedCost}
                                                        onChange={handleInputChange}
                                                        className="h-8 text-sm text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                ) : (
                                                    formatCurrency(event.estimatedCost)
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 {editingFinancials?.eventId === event.eventId ? (
                                                     <Input
                                                         type="number"
                                                         name="sponsorshipAmount"
                                                         value={editingFinancials.sponsorshipAmount}
                                                         onChange={handleInputChange}
                                                         className="h-8 text-sm text-right"
                                                         min="0"
                                                         step="0.01"
                                                     />
                                                 ) : (
                                                     formatCurrency(event.sponsorshipAmount)
                                                 )}
                                            </TableCell>
                                            <TableCell className={cn("text-right font-semibold", event.net >= 0 ? 'text-green-700' : 'text-destructive')}>
                                                {formatCurrency(event.net)}
                                                {event.net !== 0 && ( // Show badge only if not zero
                                                    <Badge variant={event.net > 0 ? 'default' : 'destructive'} className={cn("ml-2", event.net > 0 ? "bg-green-100 text-green-800" : "")}>
                                                        {event.net > 0 ? 'Profit' : 'Loss'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                             {canEditFinance && (
                                                <TableCell className="text-center">
                                                    {editingFinancials?.eventId === event.eventId ? (
                                                         <div className="flex items-center justify-center gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100" onClick={handleSaveFinancials} aria-label="Save financials">
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-gray-100" onClick={cancelEditing} aria-label="Cancel editing financials">
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => startEditing(event.eventId)} aria-label="Edit financials">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
