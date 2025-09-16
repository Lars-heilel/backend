export const SESSION_SERVICE_INTERFACE = Symbol('SESSION_SERVICE_INTERFACE');

export interface SessionServiceInterface {
    handleConnection(userId: string, socketId: string): Promise<void>;
    handleDisconnect(socketId: string): Promise<void>;
    getUserSockets(userId: string): Promise<string[]>;
}
