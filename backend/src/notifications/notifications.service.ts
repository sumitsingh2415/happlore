import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { Twilio } from 'twilio';

interface EmailPayload {
  to: string;
  subject: string;
  body: string; // HTML body
}

interface SmsPayload {
  to: string;
  body: string;
}

interface WhatsAppPayload {
  to: string;
  body: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private twilioClient: Twilio | null = null;
  private sgEnabled = false;
  private twilioEnabled = false;

  constructor(private config: ConfigService) {
    const sgKey = config.get<string>('SENDGRID_API_KEY');
    if (sgKey && sgKey.startsWith('SG.')) {
      sgMail.setApiKey(sgKey);
      this.sgEnabled = true;
      this.logger.log('✅ SendGrid enabled');
    } else {
      this.logger.warn('⚠️  SendGrid not configured — emails will be logged only');
    }

    const twilioSid = config.get<string>('TWILIO_ACCOUNT_SID');
    const twilioToken = config.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioSid && twilioToken && twilioSid.startsWith('AC')) {
      this.twilioClient = new Twilio(twilioSid, twilioToken);
      this.twilioEnabled = true;
      this.logger.log('✅ Twilio enabled');
    } else {
      this.logger.warn('⚠️  Twilio not configured — SMS/WhatsApp will be logged only');
    }
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  async sendEmail(payload: EmailPayload): Promise<void> {
    if (!this.sgEnabled) {
      this.logger.debug(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
      return;
    }

    try {
      await sgMail.send({
        to: payload.to,
        from: {
          email: this.config.get<string>('EMAIL_FROM') ?? 'hello@happlore.com',
          name: this.config.get<string>('EMAIL_FROM_NAME') ?? 'Happlore',
        },
        subject: payload.subject,
        html: payload.body,
      });
      this.logger.log(`Email sent to ${payload.to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${payload.to}`, err);
    }
  }

  // ── SMS ───────────────────────────────────────────────────────────────────
  async sendSms(payload: SmsPayload): Promise<void> {
    if (!this.twilioEnabled || !this.twilioClient) {
      this.logger.debug(`[SMS] To: ${payload.to} | Body: ${payload.body}`);
      return;
    }

    try {
      await this.twilioClient.messages.create({
        from: this.config.get<string>('TWILIO_SMS_FROM'),
        to: payload.to,
        body: payload.body,
      });
      this.logger.log(`SMS sent to ${payload.to}`);
    } catch (err) {
      this.logger.error(`Failed to send SMS to ${payload.to}`, err);
    }
  }

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  async sendWhatsApp(payload: WhatsAppPayload): Promise<void> {
    if (!this.twilioEnabled || !this.twilioClient) {
      this.logger.debug(`[WHATSAPP] To: ${payload.to} | Body: ${payload.body}`);
      return;
    }

    try {
      const toWhatsApp = payload.to.startsWith('whatsapp:')
        ? payload.to
        : `whatsapp:${payload.to}`;

      await this.twilioClient.messages.create({
        from: this.config.get<string>('TWILIO_WHATSAPP_FROM'),
        to: toWhatsApp,
        body: payload.body,
      });
      this.logger.log(`WhatsApp sent to ${payload.to}`);
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp to ${payload.to}`, err);
    }
  }
}
