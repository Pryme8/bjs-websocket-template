import { createContext, useContext, useEffect, useState, FC, useCallback } from 'react';
import { IDefaultComponentProps } from '../../interfaces/interfaces';
import { Observable } from '@babylonjs/core/Misc/observable';
import { CreateMessage, CreateResponse, IMessage, MessageTypes, ParseMessage } from '../../../shared/message';

export interface IServerProviderContext{
  client: WebSocket | null;
  messages: any[];
  sendMessage: (type: MessageTypes, data?: any, reliable?: boolean) => void;
  onMessageObservable: Observable<IMessage>;
}

const initialContext: IServerProviderContext = {
  client: null,
  messages: [],
  sendMessage: (type: MessageTypes, data?: any, reliable?: boolean) => {},
  onMessageObservable: new Observable<IMessage>(),
};

// Create a context
const WebSocketContext = createContext<IServerProviderContext>(initialContext);

// Custom hook to use the WebSocket context
export const useServer = () => useContext(WebSocketContext);

interface IWebSocketProviderProps extends IDefaultComponentProps {}
const WebSocketProvider: FC<IWebSocketProviderProps> = ({ children }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [ws, setWs] = useState<WebSocket>();    
    const [messageObservable, setMessageObservable] = useState<Observable<IMessage>>(new Observable<IMessage>());   
    const timers: {[key: string]: NodeJS.Timeout} = {};
    
    const onReceivedMessage = useCallback((data: IMessage) => {
        messageObservable.notifyObservers(data);
        if(data.uid && timers[data.uid]){
            clearTimeout(timers[data.uid]);
            delete timers[data.uid];
            console.log(`Acknowledgment received for message: ${data.uid}`);
        }else if(data.uid && !timers[data.uid]){
            //Need to send acknowledgment back to server.
            sendResponse(data.type, data.uid)
        }
    }, []);
    
    
    useEffect(() => {
      const webSocket = new WebSocket('ws://localhost:1337');
  
      webSocket.onopen = () => {
        console.log('WebSocket Connected');
      };
  
      webSocket.onmessage = (event) => {
        onReceivedMessage(ParseMessage(event.data));
      };
  
      webSocket.onerror = (error) => {
        console.warn('WebSocket Error:', error);
      };
  
      webSocket.onclose = () => {
        console.log('WebSocket Disconnected');
      };
  
      setWs(webSocket);

      if(messageObservable){
        messageObservable.clear();
      }

      return () => {
        if(webSocket.readyState === WebSocket.OPEN){
            webSocket.close();
        }
      };
    }, []);
  
    const sendMessage = useCallback((type: MessageTypes, data?: any, reliable?: boolean) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const { message, uid } = CreateMessage(type, data, reliable);
          if (uid) {
            console.log(`Sending message with acknowledgment: ${uid}`);
            waitForAcknowledgment(uid);
          }
          ws.send(message);
        } else {
          console.error("WebSocket is not open. Message not sent.");
        }
      }, [ws]);

    const sendResponse = useCallback((type: MessageTypes, uid: string, data?: any) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const message = CreateResponse(type, uid, data).message;  
          ws.send(message);
        } else {
          console.error("WebSocket is not open. Response not sent.");
        }
    }, [ws]);

    const timeout = 5000;
    const waitForAcknowledgment = useCallback((uid: string) => {
        const timer = setTimeout(() => {
          // Resend or handle timeout
        }, timeout);
        timers[uid] = timer;
      }, []); 

    useEffect(() => {       
        const handleServerReady = () => {
            sendMessage(MessageTypes.CLIENT_HANDSHAKE, undefined, true);
        };
      
        if (ws) {
          if (ws.readyState === WebSocket.OPEN) {
            // Server is already open, send message immediately
            handleServerReady();
          } else {
            // Wait for the server to be ready
            ws.addEventListener('open', handleServerReady);
          }
        }
        return () => {
          if (ws) {
            ws.removeEventListener('open', handleServerReady);
          }
        };
      }, [ws]);
  
    // The value provided to the context consumers
    const value = {
      client: ws!,
      messages,
      sendMessage,
      onMessageObservable: messageObservable,
    };
  
    return (
      <WebSocketContext.Provider value={value}>
        {children}
      </WebSocketContext.Provider>
    );
  };


  export default WebSocketProvider;