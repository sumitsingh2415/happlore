import { ConfigService } from '@nestjs/config';
interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}
interface SmsPayload {
    to: string;
    body: string;
}
interface WhatsAppPayload {
    to: string;
    body: string;
}
export declare class NotificationsService {
    private config;
    private readonly logger;
    private twilioClient;
    private sgEnabled;
    private twilioEnabled;
    constructor(config: ConfigService);
    sendEmail(payload: EmailPayload): Promise<void>;
    sendSms(payload: SmsPayload): Promise<void>;
    sendWhatsApp(payload: WhatsAppPayload): Promise<void>;
}
export {};
