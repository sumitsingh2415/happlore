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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const twilio_1 = require("twilio");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    config;
    logger = new common_1.Logger(NotificationsService_1.name);
    twilioClient = null;
    sgEnabled = false;
    twilioEnabled = false;
    constructor(config) {
        this.config = config;
        const sgKey = config.get('SENDGRID_API_KEY');
        if (sgKey && sgKey.startsWith('SG.')) {
            mail_1.default.setApiKey(sgKey);
            this.sgEnabled = true;
            this.logger.log('✅ SendGrid enabled');
        }
        else {
            this.logger.warn('⚠️  SendGrid not configured — emails will be logged only');
        }
        const twilioSid = config.get('TWILIO_ACCOUNT_SID');
        const twilioToken = config.get('TWILIO_AUTH_TOKEN');
        if (twilioSid && twilioToken && twilioSid.startsWith('AC')) {
            this.twilioClient = new twilio_1.Twilio(twilioSid, twilioToken);
            this.twilioEnabled = true;
            this.logger.log('✅ Twilio enabled');
        }
        else {
            this.logger.warn('⚠️  Twilio not configured — SMS/WhatsApp will be logged only');
        }
    }
    async sendEmail(payload) {
        if (!this.sgEnabled) {
            this.logger.debug(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
            return;
        }
        try {
            await mail_1.default.send({
                to: payload.to,
                from: {
                    email: this.config.get('EMAIL_FROM') ?? 'hello@happlore.com',
                    name: this.config.get('EMAIL_FROM_NAME') ?? 'Happlore',
                },
                subject: payload.subject,
                html: payload.body,
            });
            this.logger.log(`Email sent to ${payload.to}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${payload.to}`, err);
        }
    }
    async sendSms(payload) {
        if (!this.twilioEnabled || !this.twilioClient) {
            this.logger.debug(`[SMS] To: ${payload.to} | Body: ${payload.body}`);
            return;
        }
        try {
            await this.twilioClient.messages.create({
                from: this.config.get('TWILIO_SMS_FROM'),
                to: payload.to,
                body: payload.body,
            });
            this.logger.log(`SMS sent to ${payload.to}`);
        }
        catch (err) {
            this.logger.error(`Failed to send SMS to ${payload.to}`, err);
        }
    }
    async sendWhatsApp(payload) {
        if (!this.twilioEnabled || !this.twilioClient) {
            this.logger.debug(`[WHATSAPP] To: ${payload.to} | Body: ${payload.body}`);
            return;
        }
        try {
            const toWhatsApp = payload.to.startsWith('whatsapp:')
                ? payload.to
                : `whatsapp:${payload.to}`;
            await this.twilioClient.messages.create({
                from: this.config.get('TWILIO_WHATSAPP_FROM'),
                to: toWhatsApp,
                body: payload.body,
            });
            this.logger.log(`WhatsApp sent to ${payload.to}`);
        }
        catch (err) {
            this.logger.error(`Failed to send WhatsApp to ${payload.to}`, err);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map