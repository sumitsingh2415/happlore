import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security ──────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // ── Global Pipes ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip unknown fields
      forbidNonWhitelisted: false,
      transform: true,        // Auto-transform to DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── API Prefix ────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger Docs ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Happlore API')
      .setDescription('Backend API for Happlore — the travel planning platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & user identity')
      .addTag('leads', 'Trip enquiry & lead management')
      .addTag('waitlist', 'App waitlist sign-ups')
      .addTag('notifications', 'Notification history')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(`📚 Swagger docs: http://localhost:${process.env.PORT ?? 3001}/api/docs`);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Happlore API running on http://localhost:${port}/api/v1`);
}

bootstrap();
