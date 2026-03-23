import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadStatusDto, AssignExpertDto, LeadFilterDto } from './dto/lead.dto';
export declare class LeadsController {
    private leadsService;
    constructor(leadsService: LeadsService);
    create(dto: CreateLeadDto, user?: {
        id: string;
    }): Promise<{
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
    findOne(id: string): Promise<{
        budgetInr: number | null;
    }>;
    updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<{
        budgetInr: number | null;
    }>;
    assignExpert(id: string, dto: AssignExpertDto): Promise<{
        budgetInr: number | null;
    }>;
}
