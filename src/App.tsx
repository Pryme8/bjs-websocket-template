import './App.css'
import { useState, FC, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import webSocketLogo from './assets/websocket.svg'
import viteLogo from '/vite.svg'
import { useServer } from './providers/ServerProvider'
import { MessageTypes } from '../shared/message'
import { IUserData } from './interfaces/user/user'
import { SyncedEntity } from 'entities/syncedEntity'
import BabylonRender from './components/babylon/babylonRender'

interface IAppProps { 
}
const App: FC<IAppProps> = () => {
  const [count, setCount] = useState(0)
  const [peers, setPeers] = useState<IUserData[]>([]);
  const [localUser, setLocalUser] = useState<IUserData | null>(null);
  const {client, sendMessage, onMessageObservable} = useServer();
  const babylonRenderRef = useRef<any | null>(null);

  const callCreateEntity = (data: any, _client: WebSocket) => {
    if(babylonRenderRef?.current){
      babylonRenderRef?.current.entityUpdate(data, _client);
    }   
  };

  const callDestroyEntity = (data: any) => {
    if(babylonRenderRef?.current){
      babylonRenderRef?.current.destroyEntities(data.uids);
    }   
  };

  const [peerCursors, setPeerCursors] = useState<{ [uid: string]: {name:string; x: number; y: number } }>({});

  const onClickHandler = () => {
    sendMessage(MessageTypes.UPDATE_SERVER_DATA, { target: 'countUp' }, true);
  };

  const onResetHandler = () => { 
    sendMessage(MessageTypes.UPDATE_SERVER_DATA, { target: 'reset' }, true);
  };

  useEffect(() => {
    onMessageObservable.add((message) => {
      switch (message.type) {
        case MessageTypes.CLIENT_HANDSHAKE:
          console.log('Client handshake received', message.data);
          setCount(message.data?.serverState?.count ?? 0);
          setLocalUser(message.data?.serverState?.users.find((user: IUserData) => user.uid === message.data?.clientState?.uid) ?? null);
          setPeers(message.data?.serverState?.users.filter((user: IUserData) => user.uid !== message.data?.clientState?.uid) ?? [])
          console.log("find", message.data?.serverState?.users.find((user: IUserData) => user.uid === message.data?.clientState?.uid));
          break; 
        case MessageTypes.SEND_SERVER_DATA:
          setCount(message.data?.count ?? 0);
          setPeers(message.data?.users.filter((user: IUserData) => user.uid !== localUser?.uid));
          break;
        case MessageTypes.PEER_UPDATE:
          // Step 2: Update state on PEER_UPDATE message
          const updatedCursors = { ...peerCursors };
          const peerData = message.data; // Assuming this contains { uid: string, cursor: { x: number, y: number } }
          const centerX = window.innerWidth * 0.5;
          const centerY = window.innerHeight * 0.5;
          const absoluteX = centerX + peerData.cursorPosition.x;
          const absoluteY = centerY + peerData.cursorPosition.y;
          updatedCursors[peerData.uid] = { name: peerData.name, x: absoluteX, y: absoluteY };
          setPeerCursors(updatedCursors);
          break;
        case MessageTypes.ENTITY_UPDATE:
          if(client){
            callCreateEntity(message.data, client)
          }
          break;
        case MessageTypes.DESTROY_ENTITY:
          callDestroyEntity(message.data)
          break;          
        default:
          console.error('Unknown message type', message.type);
      }
    });
  }, [onMessageObservable, localUser]);

  useEffect(() => {
    // Only proceed if localUser is set
    if (localUser) {
      // Define the event listener
      const handleMouseMove = (event: MouseEvent) => {
        const offsetX = event.clientX - window.innerWidth * 0.5;
        const offsetY = event.clientY - window.innerHeight * 0.5;
        // Send "PEER_UPDATE" message with cursor position
        sendMessage(MessageTypes.SEND_PEER_DATA, { uid: localUser.uid, cursorPosition: { x: offsetX, y: offsetY }});
      };
  
      // Add event listener to document
      document.addEventListener('mousemove', handleMouseMove);
  
      // Cleanup function to remove the event listener
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [localUser, sendMessage]);

  return (
    <>
      <div style={{position: "absolute", left:0, top:0, width:"100%", height:"100%", zIndex:-1}}>
        <BabylonRender ref={babylonRenderRef} />
      </div>
      <div className="menu">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank">
          <img src={webSocketLogo} className="logo react webSocketLogo" alt="WebSocket logo" />
        </a>
        <h4>Vite + React + WS</h4>
        <div className="card">
          <button className="pointerEventsOn" onClick={onClickHandler}>
            count is {count}
          </button>
          <button className="pointerEventsOn" onClick={onResetHandler}>
            Reset
          </button>       
        </div>
        <div className="card">
          <h2>Users</h2>
          <h3>You are logged in as {localUser?.name ?? "unknown"}</h3>
          <p>Other Users:</p>
          <ul>
            {peers.map((user, index) => (
              <li key={index}>{user.name}</li>
            ))}
          </ul>
        </div>
      </div>

      {Object.entries(peerCursors).map(([uid, data]) => (
        <div key={uid} className='peerCursor' style={{ left: data.x, top: data.y }}>
          <span>{data.name}</span>
        </div>
      ))} 
    </>
  )
}

export default App
