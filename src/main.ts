import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from '@core/config/envConfig';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from '@common/fliter/allExeptionFilter';
import * as process from 'node:process';

async function bootstrap(): Promise<void> {
    const isProd = process.env.NODE_ENV === 'production';
    const app = await NestFactory.create(AppModule, {
        logger: isProd ? ['warn', 'error', 'log'] : ['error', 'log', 'warn', 'verbose', 'debug'],
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
    if (!isProd) {
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
    }

    //Global filters
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
    await app.listen(env.get('PORT') ?? 3001);
}
void bootstrap();
