import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JoinWaitlistDto } from './dto/waitlist.dto';
export declare class WaitlistService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
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
