export const WS_SESSION_INTERFACE = Symbol('WS_SESSION_INTERFACE');
export interface WsSessionInterface {
    addSession(userId: string, socketId: string): Promise<void>;
    removeSession(socketId: string): Promise<void>;
    getUserSockets(userId: string): Promise<string[]>;
    getUserId(socketId: string): Promise<string>;
}
