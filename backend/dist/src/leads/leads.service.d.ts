import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto, UpdateLeadStatusDto, AssignExpertDto, LeadFilterDto } from './dto/lead.dto';
export declare class LeadsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    create(dto: CreateLeadDto, userId?: string): Promise<{
        budgetInr: number | null;
    }>;
    findOne(id: string): Promise<{
        budgetInr: number | null;
    }>;
    findAll(filter: LeadFilterDto): Promise<{
        data: {
            budgetInr: number | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<{
        budgetInr: number | null;
    }>;
    assignExpert(id: string, dto: AssignExpertDto): Promise<{
        budgetInr: number | null;
    }>;
    private handleNewLead;
    private formatLead;
}
