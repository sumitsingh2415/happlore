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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let LeadsService = class LeadsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async create(dto, userId) {
        const lead = await this.prisma.lead.create({
            data: {
                ...dto,
                budgetInr: dto.budgetInr ? BigInt(dto.budgetInr) : undefined,
                departureDate: dto.departureDate ? new Date(dto.departureDate) : undefined,
                returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
                userId,
                source: dto.source ?? 'web',
            },
        });
        void this.handleNewLead(lead);
        return this.formatLead(lead);
    }
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                assignedExpert: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        return this.formatLead(lead);
    }
    async findAll(filter) {
        const { status, destination, page = 1, limit = 20 } = filter;
        const skip = (page - 1) * limit;
        const [leads, total] = await Promise.all([
            this.prisma.lead.findMany({
                where: {
                    ...(status && { status }),
                    ...(destination && {
                        destination: { contains: destination, mode: 'insensitive' },
                    }),
                },
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    assignedExpert: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.lead.count({
                where: {
                    ...(status && { status }),
                    ...(destination && {
                        destination: { contains: destination, mode: 'insensitive' },
                    }),
                },
            }),
        ]);
        return {
            data: leads.map(this.formatLead.bind(this)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async updateStatus(id, dto) {
        const lead = await this.findOne(id);
        const updated = await this.prisma.lead.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.notes && { notes: dto.notes }),
            },
        });
        return this.formatLead(updated);
    }
    async assignExpert(id, dto) {
        const expert = await this.prisma.user.findUnique({
            where: { id: dto.expertId },
        });
        if (!expert)
            throw new common_1.NotFoundException('Expert not found');
        const updated = await this.prisma.lead.update({
            where: { id },
            data: { assignedExpertId: dto.expertId, status: 'CONTACTED' },
        });
        if (expert.phone) {
            void this.notifications.sendWhatsApp({
                to: expert.phone,
                body: `🗂️ New lead assigned to you!\nDestination: ${updated.destination ?? 'TBD'}\nTraveller type: ${updated.travellerType ?? 'TBD'}\nContact: ${updated.phone ?? updated.email ?? 'N/A'}\nBudget: ₹${updated.budgetInr?.toLocaleString('en-IN') ?? 'TBD'}`,
            });
        }
        return this.formatLead(updated);
    }
    async handleNewLead(lead) {
        if (lead.email) {
            void this.notifications.sendEmail({
                to: lead.email,
                subject: '✈️ Your Happlore trip request received!',
                body: `
          <h2>Hi there!</h2>
          <p>We've received your request for a trip to <strong>${lead.destination ?? 'your dream destination'}</strong>.</p>
          <p>One of our travel experts will reach out to you within <strong>15 minutes</strong> on WhatsApp or phone.</p>
          <p>In the meantime, feel free to explore more destinations on <a href="https://happlore.com">happlore.com</a>.</p>
          <p>— The Happlore Team 🌍</p>
        `,
            });
        }
        if (lead.phone && lead.whatsappOptIn) {
            void this.notifications.sendWhatsApp({
                to: lead.phone,
                body: `Hi! 👋 We've received your Happlore trip request for *${lead.destination ?? 'your destination'}*.\n\nOur travel expert will connect with you within 15 minutes!\n\n— Team Happlore 🌍`,
            });
        }
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            void this.notifications.sendEmail({
                to: adminEmail,
                subject: `🆕 New lead — ${lead.destination ?? 'Unknown'}`,
                body: `New lead received: <a href="https://happlore.com/admin/leads/${lead.id}">View Lead #${lead.id}</a>`,
            });
        }
    }
    formatLead(lead) {
        return {
            ...lead,
            budgetInr: lead.budgetInr !== null && lead.budgetInr !== undefined
                ? Number(lead.budgetInr)
                : null,
        };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map