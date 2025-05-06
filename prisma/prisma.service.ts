import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from './generated';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    async onModuleInit() {
        try {
            await this.$connect();
            Logger.log('База доступна');
        } catch (error) {
            Logger.log('База не доступна', error);
            process.exit(1);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
