import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/waitlist.dto';
export declare class WaitlistController {
    private waitlistService;
    constructor(waitlistService: WaitlistService);
    join(dto: JoinWaitlistDto): Promise<{
        message: string;
    }>;
    list(page?: number, limit?: number): Promise<{
        data: {
            email: string;
            id: string;
            createdAt: Date;
            source: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
