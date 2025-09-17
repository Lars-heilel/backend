const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECTION_SUCCESS: 'connection_success',
    CONNECTION_ERROR: 'connection_error',
    DISCONNECT_ERROR: 'disconnect_error',
} as const;
const FRIENDSHIP_EVENT = {
    FRIENDSHIP_REQUEST_RECEIVED: 'friendship_request_received',
    FRIENDSHIP_REQUEST_ACCEPTED: 'friendship_request_accepted',
    FRIENDSHIP_REQUEST_REJECTED: 'friendship_request_rejected',
    FRIENDSHIP_DELETED: 'friendship_deleted',
} as const;

export const ROOM_EVENT = {
    JOIN_ROOM: 'join_room',
} as const;
const MESSAGE_EVENT = {
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
} as const;
export { SOCKET_EVENTS, FRIENDSHIP_EVENT, MESSAGE_EVENT };
