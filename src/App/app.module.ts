import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { BcryptModule } from 'src/modules/security/bcrypt/bcrypt.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        BcryptModule,
    ],
})
export class AppModule {}
