"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    config;
    notifications;
    constructor(prisma, jwtService, config, notifications) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.notifications = notifications;
    }
    async register(dto) {
        if (!dto.email && !dto.phone) {
            throw new common_1.BadRequestException('Email or phone is required');
        }
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    dto.email ? { email: dto.email } : {},
                    dto.phone ? { phone: dto.phone } : {},
                ],
            },
        });
        if (existing)
            throw new common_1.ConflictException('User already exists');
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : undefined;
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                passwordHash,
            },
        });
        return this.issueTokens(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    dto.email ? { email: dto.email } : {},
                    dto.phone ? { phone: dto.phone } : {},
                ],
            },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password ?? '', user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.issueTokens(user);
    }
    async sendOtp(dto) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        let user = await this.prisma.user.findFirst({
            where: dto.channel === client_1.NotificationChannel.EMAIL
                ? { email: dto.target }
                : { phone: dto.target },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: dto.channel === client_1.NotificationChannel.EMAIL
                    ? { email: dto.target }
                    : { phone: dto.target },
            });
        }
        await this.prisma.otpToken.create({
            data: { userId: user.id, otp, channel: dto.channel, expiresAt },
        });
        if (dto.channel === client_1.NotificationChannel.EMAIL) {
            await this.notifications.sendEmail({
                to: dto.target,
                subject: 'Your Happlore OTP',
                body: `Your one-time password is: <strong>${otp}</strong>. Valid for 10 minutes.`,
            });
        }
        else if (dto.channel === client_1.NotificationChannel.SMS) {
            await this.notifications.sendSms({
                to: dto.target,
                body: `Your Happlore OTP is ${otp}. Valid for 10 minutes.`,
            });
        }
        return { message: 'OTP sent successfully' };
    }
    async verifyOtp(dto) {
        const user = await this.prisma.user.findFirst({
            where: dto.channel === client_1.NotificationChannel.EMAIL
                ? { email: dto.target }
                : { phone: dto.target },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const token = await this.prisma.otpToken.findFirst({
            where: {
                userId: user.id,
                otp: dto.otp,
                channel: dto.channel,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!token)
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        await this.prisma.otpToken.update({
            where: { id: token.id },
            data: { used: true },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        return this.issueTokens(stored.user);
    }
    async getMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, isVerified: true, avatarUrl: true, createdAt: true,
            },
        });
    }
    async issueTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
        });
        const rawRefresh = (0, uuid_1.v4)();
        const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId: user.id, token: rawRefresh, expiresAt: refreshExpiresAt },
        });
        return { accessToken, refreshToken: rawRefresh };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map