import {
  Injectable, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { NotificationChannel } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // Check for duplicates
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });
    if (existing) throw new ConflictException('User already exists');

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

  // ── Login (email/phone + password) ───────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password ?? '', user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Ensure user exists (create a stub if needed)
    let user = await this.prisma.user.findFirst({
      where:
        dto.channel === NotificationChannel.EMAIL
          ? { email: dto.target }
          : { phone: dto.target },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data:
          dto.channel === NotificationChannel.EMAIL
            ? { email: dto.target }
            : { phone: dto.target },
      });
    }

    await this.prisma.otpToken.create({
      data: { userId: user.id, otp, channel: dto.channel, expiresAt },
    });

    // Send OTP via appropriate channel
    if (dto.channel === NotificationChannel.EMAIL) {
      await this.notifications.sendEmail({
        to: dto.target,
        subject: 'Your Happlore OTP',
        body: `Your one-time password is: <strong>${otp}</strong>. Valid for 10 minutes.`,
      });
    } else if (dto.channel === NotificationChannel.SMS) {
      await this.notifications.sendSms({
        to: dto.target,
        body: `Your Happlore OTP is ${otp}. Valid for 10 minutes.`,
      });
    }

    return { message: 'OTP sent successfully' };
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findFirst({
      where:
        dto.channel === NotificationChannel.EMAIL
          ? { email: dto.target }
          : { phone: dto.target },
    });
    if (!user) throw new UnauthorizedException('User not found');

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

    if (!token) throw new UnauthorizedException('Invalid or expired OTP');

    // Mark OTP as used & verify user
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

  // ── Refresh Tokens ────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.user);
  }

  // ── Get Current User ──────────────────────────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isVerified: true, avatarUrl: true, createdAt: true,
      },
    });
  }

  // ── Token helpers ─────────────────────────────────────────────────────────
  private async issueTokens(user: { id: string; email?: string | null; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
    });

    const rawRefresh = uuidv4();
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: rawRefresh, expiresAt: refreshExpiresAt },
    });

    return { accessToken, refreshToken: rawRefresh };
  }
}
