import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateLeadDto, UpdateLeadStatusDto, AssignExpertDto, LeadFilterDto,
} from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ── Create lead (from web funnel) ─────────────────────────────────────────
  async create(dto: CreateLeadDto, userId?: string) {
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

    // Fire-and-forget: notify user + auto-assign expert
    void this.handleNewLead(lead);

    return this.formatLead(lead);
  }

  // ── Get a single lead ─────────────────────────────────────────────────────
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedExpert: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.formatLead(lead);
  }

  // ── List leads (admin/expert, paginated) ──────────────────────────────────
  async findAll(filter: LeadFilterDto) {
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

  // ── Update lead status ────────────────────────────────────────────────────
  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
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

  // ── Assign expert ─────────────────────────────────────────────────────────
  async assignExpert(id: string, dto: AssignExpertDto) {
    const expert = await this.prisma.user.findUnique({
      where: { id: dto.expertId },
    });
    if (!expert) throw new NotFoundException('Expert not found');

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { assignedExpertId: dto.expertId, status: 'CONTACTED' },
    });

    // Notify expert via WhatsApp
    if (expert.phone) {
      void this.notifications.sendWhatsApp({
        to: expert.phone,
        body: `🗂️ New lead assigned to you!\nDestination: ${updated.destination ?? 'TBD'}\nTraveller type: ${updated.travellerType ?? 'TBD'}\nContact: ${updated.phone ?? updated.email ?? 'N/A'}\nBudget: ₹${updated.budgetInr?.toLocaleString('en-IN') ?? 'TBD'}`,
      });
    }

    return this.formatLead(updated);
  }

  // ── New lead handler ──────────────────────────────────────────────────────
  private async handleNewLead(lead: {
    id: string;
    email?: string | null;
    phone?: string | null;
    destination?: string | null;
    whatsappOptIn?: boolean;
  }) {
    // 1. Send acknowledgement to traveller
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

    // 2. Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      void this.notifications.sendEmail({
        to: adminEmail,
        subject: `🆕 New lead — ${lead.destination ?? 'Unknown'}`,
        body: `New lead received: <a href="https://happlore.com/admin/leads/${lead.id}">View Lead #${lead.id}</a>`,
      });
    }
  }

  // ── Serialize BigInt ──────────────────────────────────────────────────────
  private formatLead(lead: Record<string, unknown>) {
    return {
      ...lead,
      budgetInr: lead.budgetInr !== null && lead.budgetInr !== undefined
        ? Number(lead.budgetInr)
        : null,
    };
  }
}
