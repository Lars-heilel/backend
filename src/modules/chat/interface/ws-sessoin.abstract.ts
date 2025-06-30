export abstract class WsSessionAbstract {
    abstract addSession(userId: string, socketId: string): Promise<void>;
    abstract removeSession(socketId: string): Promise<void>;
    abstract getUserSockets(userId: string): Promise<string[]>;
    abstract getUserId(socketId: string): Promise<string>;
}
