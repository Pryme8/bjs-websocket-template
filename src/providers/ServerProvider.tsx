import React, { createContext, useContext, useEffect, useState, FC, useCallback } from 'react';
import { IDefaultComponentProps } from '../interfaces/interfaces';
import { Observable } from '@babylonjs/core/Misc/observable';
import { IMessage, ParseMessage } from '../../shared/message';


export interface IServerProviderContext{
    server: WebSocket | null;
    messages: any[];
    sendMessage: (message: any) => void;
    onMessageObservable: Observable<IMessage>;
}

const initialContext: IServerProviderContext = {
    server: null,
    messages: [],
    sendMessage: (message: any) => {},
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

    const onReceivedMessage = useCallback((data: any) => {
        messageObservable.notifyObservers(data);
    }, []);
  
    useEffect(() => {
      const webSocket = new WebSocket('ws://localhost:3001');
  
      webSocket.onopen = () => {
        console.log('WebSocket Connected');
      };
  
      webSocket.onmessage = (event) => {
        onReceivedMessage(ParseMessage(event.data));
      };
  
      webSocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
  
      webSocket.onclose = () => {
        console.log('WebSocket Disconnected');
      };
  
      setWs(webSocket);

      if(messageObservable){
        messageObservable.clear();
      }

      return () => {
        webSocket.close();
      };
    }, []);
  
    const sendMessage = (message: any) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        } else {
        console.error("WebSocket is not open. Message not sent.");
        }
    };
  
    // The value provided to the context consumers
    const value = {
      server: ws!,
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