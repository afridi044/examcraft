import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend communication
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', // Alternative frontend port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    // VM-specific origins - hardcoded for deployment
    'http://20.244.0.22:3000', // VM frontend
    'http://20.244.0.22:3001' // VM frontend alternative port
  ];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('ExamCraft API')
    .setDescription(
      'Backend API for ExamCraft - AI-powered quiz and flashcard platform',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Health', 'Health check endpoints')
    .addTag('Quiz', 'Quiz management endpoints')
    .addTag('Flashcards', 'Flashcard management endpoints')
    .addTag('Dashboard', 'Analytics and dashboard endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 5001;
  await app.listen(port);

  logger.log(`🚀 ExamCraft Backend is running on: http://localhost:${port}`);
  logger.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔄 CORS enabled for frontend: http://localhost:3000`);
}

void bootstrap();
