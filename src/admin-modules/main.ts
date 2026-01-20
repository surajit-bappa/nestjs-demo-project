import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'tsconfig-paths/register';

let server: any;

export default async function handler(req, res) {
  // Force IST timezone
  process.env.TZ = 'Asia/Kolkata';

  if (!server) {
    const app = await NestFactory.create(AppModule);

    // Global API prefix
    app.setGlobalPrefix('api/');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.enableCors({
      origin: [
        'https://inventorymanagement-portal-reactjs.vercel.app',
        'http://localhost:8080',
        'https://bybsa-user-portal-dev.cb-dev.in',
        'http://bybsa-user-portal-dev.cb-dev.in',
        'http://localhost:3000',
        'https://bybsa-admin-portal-dev.cb-dev.in'
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    await app.init();

    server = app.getHttpAdapter().getInstance();
  }

  return server(req, res);
}
