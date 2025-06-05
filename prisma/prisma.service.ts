import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            await this.$connect();
            Logger.log('DB ONLINE');
        } catch (error) {
            Logger.log('DB Offline', error);
            process.exit(1);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
