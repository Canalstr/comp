import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  // Configure body parser limits for file uploads (base64 encoded files)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: true, // Allow requests from any origin
    credentials: true, // Allow cookies to be sent cross-origin (for auth)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Organization-Id',
    ],
  });

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Get server configuration from environment variables
  const port = process.env.PORT ?? 3333;
  const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for this application')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for authentication',
      },
      'apikey',
    )
    .addServer(baseUrl, 'API Server')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep auth between page refreshes
    },
  });

  const host = process.env.HOST ?? '0.0.0.0';
  const server = await app.listen(port, host);
  const address = server.address();
  const actualPort = typeof address === 'string' ? port : address?.port || port;
  const actualUrl = `http://${host}:${actualPort}`;

  console.log(`Application is running on: ${actualUrl}`);
  console.log(`API Documentation available at: ${actualUrl}/api/docs`);
}

// Handle bootstrap errors properly
void bootstrap().catch((error: unknown) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
