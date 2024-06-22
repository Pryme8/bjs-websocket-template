export enum MessageTypes{
    GET_SERVER_DATA = 'GET_SERVERDATA',
    SEND_SERVER_DATA = 'SEND_SERVER_DATA',
    UPDATE_SERVER_DATA = 'UPDATE_SERVER_DATA',
}
  
export interface IMessage {
    type: MessageTypes;
    data?: any;
}

export const CreateMessage = (type: MessageTypes, data?: any): string => {
    return JSON.stringify({
        type,
        data,
    });
}

export const ParseMessage = (message: Buffer): IMessage => {
    return JSON.parse(message.toString());
}

export const ParseMessageString = (message: string): IMessage => {
    return JSON.parse(message);
}