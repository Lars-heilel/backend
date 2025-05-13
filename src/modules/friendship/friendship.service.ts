import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FriendshipService {
    private readonly logger = new Logger(FriendshipService.name);
    constructor(private prisma: PrismaService) {}
    async sendRequest(requesterId: string, addresseeId: string) {
        this.logger.debug(`Создание запроса на дружбу между пользователями:
                [отправитель: ${requesterId.substring(0, 10)},адресат:${addresseeId.substring(0, 10)}
        ]`);
        if (requesterId === addresseeId)
            throw new ConflictException('Нельзя отправить запрос себе');
        const existingRequest = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: requesterId, addresseeId: addresseeId },
                    { requesterId: addresseeId, addresseeId: requesterId },
                ],
            },
        });
        this.logger.log(
            `Проверка есть ли уже запрос ${JSON.stringify(existingRequest).toString().substring(0, 20)}`,
        );
        if (existingRequest?.status === 'PENDING') {
            throw new ConflictException('Запрос на дружбу уже существует');
        }
        if (existingRequest?.status === 'ACCEPTED')
            throw new ConflictException('Запрос уже принят');
        const friendRequest = await this.prisma.friendship.create({
            data: { requesterId: requesterId, addresseeId: addresseeId, status: 'PENDING' },
        });
        this.logger.log(`Запрос отправлен ${JSON.stringify(friendRequest)}`);
        return friendRequest;
    }
    async incomingRequest(userId: string) {
        return this.prisma.friendship.findMany({
            where: { addresseeId: userId, status: 'PENDING' },
        });
    }
    async updateFriendshipStatus(
        friendshipId: string,
        userId: string,
        type: 'ACCEPTED' | 'REJECTED',
    ) {
        this.logger.debug(
            `Изменение статуса для пользовпателя ${userId},схема:${friendshipId},тип:${type}`,
        );
        const findFriendshipSchema = await this.prisma.friendship.findFirst({
            where: { id: friendshipId },
        });
        if (!findFriendshipSchema) throw new NotFoundException('запрос не найден');
        if (findFriendshipSchema?.addresseeId !== userId)
            throw new ForbiddenException('Нет прав для изменения запроса');
        if (findFriendshipSchema.status === 'ACCEPTED')
            throw new ConflictException('Запрос уже принят');
        if (findFriendshipSchema.status === 'REJECTED') {
            await this.prisma.friendship.delete({ where: { id: friendshipId } });
            return { message: 'Запрос отклонен' };
        }
        const updateStatus = await this.prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: type },
        });
        this.logger.log(`обновленный статус ${JSON.stringify(updateStatus.status)}`);
        return { message: `Статус успешно обновлен ${updateStatus.status}` };
    }
    async deleteFriend(requesterId: string, addresseeId: string) {
        this.logger.debug(
            `Разрыв статуса дружбы между пользователями ${requesterId},${addresseeId}`,
        );
        const friendshipSchema = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: requesterId, addresseeId: addresseeId },
                    { requesterId: addresseeId, addresseeId: requesterId },
                ],
            },
        });
        this.logger.log(`${friendshipSchema?.id}`);
        if (!friendshipSchema) throw new NotFoundException('дружба не обнаружена');
        if (
            friendshipSchema?.requesterId !== requesterId &&
            friendshipSchema?.addresseeId !== requesterId
        )
            throw new ForbiddenException('Нет доступа для удаления');

        this.logger.log(`найдена схема ${friendshipSchema?.id}`);
        await this.prisma.friendship.delete({
            where: { id: friendshipSchema?.id },
        });
        return { message: `Дружба между ${requesterId} и ${addresseeId} разорвана` };
    }
}
