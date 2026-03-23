"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let WaitlistService = class WaitlistService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async join(dto) {
        const existing = await this.prisma.waitlist.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            return { message: "You're already on the waitlist! We'll reach out soon." };
        }
        await this.prisma.waitlist.create({
            data: { email: dto.email, source: dto.source ?? 'web' },
        });
        void this.notifications.sendEmail({
            to: dto.email,
            subject: '🎉 You\'re on the Happlore waitlist!',
            body: `
        <h2>You're in! 🎉</h2>
        <p>Thanks for joining the Happlore early access waitlist.</p>
        <p>We're putting the finishing touches on our app — you'll be among the first to know when it launches.</p>
        <p>In the meantime, plan your next holiday at <a href="https://happlore.com">happlore.com</a>.</p>
        <p>— The Happlore Team 🌍</p>
      `,
        });
        return { message: "You're on the list! We'll reach out soon. 🎉" };
    }
    async list(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.waitlist.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.waitlist.count(),
        ]);
        return { data: entries, meta: { page, limit, total } };
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map