
import type { Event } from '@/types/event';

export interface FinancialSummary {
  totalEstimatedCost: number;
  totalSponsorshipReceived: number;
  netPosition: number; // Sponsorship - Cost
  events: FinancialEventDetail[];
}

export interface FinancialEventDetail {
  eventId: string;
  eventName: string;
  estimatedCost: number;
  sponsorshipAmount: number;
  net: number;
}

/**
 * Generates a simple financial summary report based on event data.
 * @param events An array of events to include in the report.
 * @returns A FinancialSummary object.
 */
export async function generateFinancialReport(events: Event[]): Promise<FinancialSummary> {
  // Simulate report generation delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  let totalEstimatedCost = 0;
  let totalSponsorshipReceived = 0;
  const eventDetails: FinancialEventDetail[] = [];

  events.forEach(event => {
    const cost = event.estimatedCost ?? 0;
    const sponsorship = event.sponsorshipAmount ?? 0;
    const net = sponsorship - cost;

    totalEstimatedCost += cost;
    totalSponsorshipReceived += sponsorship;

    eventDetails.push({
      eventId: event.id,
      eventName: event.name,
      estimatedCost: cost,
      sponsorshipAmount: sponsorship,
      net: net,
    });
  });

  const summary: FinancialSummary = {
    totalEstimatedCost,
    totalSponsorshipReceived,
    netPosition: totalSponsorshipReceived - totalEstimatedCost,
    events: eventDetails,
  };

  console.log('Generated Financial Report:', summary);
  return summary;
}

// Potential future functions:
// export async function recordTransaction(...)
// export async function getTransactionsForEvent(...)
