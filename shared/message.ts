export enum MessageTypes{
    GET_SERVER_DATA = 'GET_SERVERDATA',
    SEND_SERVER_DATA = 'SEND_SERVER_DATA',
    UPDATE_SERVER_DATA = 'UPDATE_SERVER_DATA',
    CLIENT_CONNECTED = 'CLIENT_CONNECTED',
    CLIENT_DISCONNECTED = 'CLIENT_DISCONNECTED',
    CLIENT_HANDSHAKE = 'CLIENT_HANDSHAKE',
    SEND_PEER_DATA = 'SEND_PEER_DATA',
    PEER_UPDATE = 'PEER_UPDATE',
    ENTITY_UPDATE = 'ENTITY_UPDATE',
    DESTROY_ENTITY = 'DESTROY_ENTITY',
}

export interface IMessage {
    type: MessageTypes;
    uid?: string;
    data?: any;
}

export const CreateMessage = (type: MessageTypes, data?: any, reliable?: boolean): {message: string, uid?: string} => {
    const uid = reliable ? crypto.randomUUID() : undefined;   
    return {
        message: JSON.stringify({
            type,
            uid,
            data,
        }),
        uid,
    };
}

export const CreateResponse = (type: MessageTypes, uid: string, data?: any): {message: string, uid?: string} => { 
    return {
        message: JSON.stringify({
            type,
            uid,
            data,
        }),
        uid,
    };
}

export const ParseMessage = (message: Buffer): IMessage => {
    return JSON.parse(message.toString("utf-8"));
}

export const ParseMessageString = (message: string): IMessage => {
    return JSON.parse(message);
}