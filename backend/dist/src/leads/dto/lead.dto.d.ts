import { LeadStatus, TravellerType } from '@prisma/client';
export declare class CreateLeadDto {
    travellerType?: TravellerType;
    destination?: string;
    departureCity?: string;
    departureDate?: string;
    returnDate?: string;
    durationDays?: number;
    numAdults?: number;
    numChildren?: number;
    budgetInr?: number;
    activities?: string[];
    phone?: string;
    email?: string;
    whatsappOptIn?: boolean;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}
export declare class UpdateLeadStatusDto {
    status: LeadStatus;
    notes?: string;
}
export declare class AssignExpertDto {
    expertId: string;
}
export declare class LeadFilterDto {
    status?: LeadStatus;
    destination?: string;
    page?: number;
    limit?: number;
}
