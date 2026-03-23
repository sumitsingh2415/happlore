import { NotificationChannel } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
}
export declare class LoginDto {
    email?: string;
    phone?: string;
    password?: string;
}
export declare class SendOtpDto {
    target: string;
    channel: NotificationChannel;
}
export declare class VerifyOtpDto {
    target: string;
    otp: string;
    channel: NotificationChannel;
}
export declare class RefreshDto {
    refreshToken: string;
}
