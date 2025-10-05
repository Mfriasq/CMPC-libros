import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationError } from "class-validator";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar archivos estáticos
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Habilitamos CORS para permitir conexiones desde el frontend
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  });

  // Validación global avanzada con class-validator y class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo propiedades con decoradores de validación
      forbidNonWhitelisted: true, // Rechazar propiedades no permitidas
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true, // Conversión implícita de tipos
      },
      disableErrorMessages: false, // Mantener mensajes de error detallados
      validationError: {
        target: false, // No incluir el objeto completo en errores
        value: false, // No incluir valores por seguridad
      },
      exceptionFactory: (errors) => {
        // Formatear errores de validación de manera consistente
        const formattedErrors: { [key: string]: string[] } = {};

        const extractErrors = (error: any, prefix = "") => {
          const property = prefix
            ? `${prefix}.${error.property}`
            : error.property;

          if (error.constraints) {
            if (!formattedErrors[property]) {
              formattedErrors[property] = [];
            }

            Object.values(error.constraints).forEach((message: string) => {
              formattedErrors[property].push(message);
            });
          }

          if (error.children && error.children.length > 0) {
            error.children.forEach((child: any) => {
              extractErrors(child, property);
            });
          }
        };

        errors.forEach((error) => extractErrors(error));

        return new BadRequestException({
          statusCode: 400,
          error: "Validation Error",
          message: "Los datos enviados no cumplen con las reglas de validación",
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      },
    })
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle("NestJS API")
    .setDescription("API desarrollada con NestJS, TypeScript y PostgreSQL")
    .setVersion("1.0")
    .addTag("api")
    .addBearerAuth() // Soporte para JWT en Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(
    `📚 Documentación disponible en: http://localhost:${port}/api/docs`
  );
}

bootstrap();
