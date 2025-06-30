import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './core/config/envConfig';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['debug', 'verbose', 'log', 'warn', 'error'],
    });

    const env = app.get(ConfigService<Env>);

    //Cookies
    app.use(cookieParser());

    //Cors
    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
    });
    //Swagger
    const config = new DocumentBuilder()
        .setTitle('Realtime chat app')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter a JWT token in the format: **Bearer <token>**',
            },
            'access-token',
        )
        .addCookieAuth('refresh-token', {
            type: 'apiKey',
            in: 'cookie',
            description: 'Refresh token to get a new access token',
        })
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, documentFactory, {
        swaggerOptions: {
            withCredentials: true,
            persistAuthorization: true,
            docExpansion: 'none',
            showRequestDuration: true,
        },
    });

    await app.listen(env.get('PORT') ?? 3001);

    Logger.log(`Swagger on http://localhost:${env.get('PORT')}/api`);
    Logger.log(`PgAdmin http://localhost:8080 `);
    Logger.log(`Prisma Studio is up on http://localhost:5555`);
}
bootstrap();
