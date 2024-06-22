import { useState, FC, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import webSocketLogo from './assets/websocket.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useServer } from './providers/ServerProvider'
import { CreateMessage, MessageTypes } from '../shared/message'

interface IAppProps { 
}
const App: FC<IAppProps> = () => {
  const [count, setCount] = useState(0)
  const {server, sendMessage, onMessageObservable} = useServer();

  const onClickHandler = () => {
    sendMessage(CreateMessage(MessageTypes.UPDATE_SERVER_DATA, { target: 'countUp' }));
  };

  const onResetHandler = () => { 
    sendMessage(CreateMessage(MessageTypes.UPDATE_SERVER_DATA, { target: 'reset' }));
  };

  useEffect(() => {
    onMessageObservable.add((message) => {
      switch (message.type) { 
        case MessageTypes.SEND_SERVER_DATA:
          setCount(message.data?.count ?? 0);
          break;
        default:
          console.error('Unknown message type', message.type);
      }
    });
   
    const handleServerReady = () => {
      sendMessage(CreateMessage(MessageTypes.GET_SERVER_DATA));
    };
  
    if (server) {
      if (server.readyState === WebSocket.OPEN) {
        // Server is already open, send message immediately
        handleServerReady();
      } else {
        // Wait for the server to be ready
        server.addEventListener('open', handleServerReady);
      }
    }
    return () => {
      if (server) {
        server.removeEventListener('open', handleServerReady);
      }
    };
  }, [server, onMessageObservable]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank">
          <img src={webSocketLogo} className="logo react webSocketLogo" alt="WebSocket logo" />
        </a>
      </div>
      <h1>Vite + React + WS</h1>
      <div className="card">
        <button onClick={onClickHandler}>
          count is {count}
        </button>
        <button onClick={onResetHandler}>
          Reset
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
