import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './core/config/envConfig';
import { Logger } from '@nestjs/common';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const env = app.get(ConfigService<Env>);

    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
    });

    await app.listen(env.get('PORT') ?? 3001);
    Logger.log(` Server on http://localhost:${env.get('PORT')}`);
    Logger.log(`PgAdmin http://localhost:8080 `);
    Logger.log(`Prisma Studio is up on http://localhost:5555`);
}
bootstrap();
