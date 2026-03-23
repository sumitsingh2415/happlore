import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JoinWaitlistDto } from './dto/waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async join(dto: JoinWaitlistDto) {
    const existing = await this.prisma.waitlist.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      // Idempotent — don't error, just confirm
      return { message: "You're already on the waitlist! We'll reach out soon." };
    }

    await this.prisma.waitlist.create({
      data: { email: dto.email, source: dto.source ?? 'web' },
    });

    // Send welcome email (fire-and-forget)
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
}
