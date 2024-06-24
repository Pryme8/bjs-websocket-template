import express from 'express';
import { WebSocketServer, WebSocket} from 'ws';
import { CreateMessage, CreateResponse, IMessage, MessageTypes, ParseMessage } from '../shared/message';
import { User } from './user/user';
import { NullEngineManager } from './nullEngineManager/nullEngineManager';
import { BouncingBall, IBouncingBall } from '../shared/entities/prefabs/bouncingBall';
import { SyncedEntity, SyncedEntityLocation } from '../shared/entities/syncedEntity';
import { EntityClassMap } from 'entities/entities';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';


// Initialize an Express application
const app = express();
const PORT = process.env.PORT || 1337;

// Serve static files from a directory (optional)
app.use(express.static('public'));

// Create an HTTP server from the Express app
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

const nullEngineManager = NullEngineManager.Instance;
interface IServerState {
  connectedUsers: number;
  entities: SyncedEntity[];
  users: Map<string, User>;
}

const ServerState: IServerState = {
  connectedUsers: 0,
  entities: [],
  users: new Map<string, User>(),
};

const ServerStateSerialized = () => {
  return {
    connectedUsers: ServerState.connectedUsers,
    count: ServerState.entities.length,
    users: Array.from(ServerState.users.values()).map((user)=>user.serialize()),
  }
}

const SSS = ServerStateSerialized;

const SyncServerStateToAllClients = (wss: WebSocketServer) => {
  console.log('Syncing server state to all clients', wss.clients.size)
  const message = CreateMessage(MessageTypes.SEND_SERVER_DATA, SSS()).message;
  SendToAllClients(wss.clients, message)
}

const SendToAllClients = (clients: Set<WebSocket>, message: string) => {
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  const uid = crypto.randomUUID();
  console.log('Client connected', uid);
  ServerState.users.set(uid, new User(uid, `User ${uid.split("-")[0]}`, ws));

  const timers: {[key: string]: NodeJS.Timeout} = {};

  const sendResponse = (type: MessageTypes, uid: string, data?: any) => {
    ws.send(
      CreateResponse(type, uid, data).message
    );
  };

  const sendMessages = (type: MessageTypes, data?: any, reliable?: boolean) => {
    ws.send(CreateMessage(type, data).message);
  };

  const handleResponseMessage = (type:MessageTypes, message: IMessage, data?: any) => {
    if(!message.uid){
      sendMessages(type, data);
    }else{
      sendResponse(type, message.uid, data);
    }
  };

  ws.on('message', async (buffer: Buffer) => { 
      const message = ParseMessage(buffer);
      // Further processing...
      switch (message.type) {
        case MessageTypes.CLIENT_HANDSHAKE:{
          // Send data back to client
          handleResponseMessage(MessageTypes.CLIENT_HANDSHAKE, message, {
            serverState: {...SSS()},
            clientState: {uid: uid},
          });
        }
        break;
        case MessageTypes.GET_SERVER_DATA:{
          // Send data back to client
          handleResponseMessage(MessageTypes.SEND_SERVER_DATA, message, {...SSS()});
        }
        break;
        case MessageTypes.UPDATE_SERVER_DATA:{
          const target = message.data?.target;
          switch(target){
            case 'countUp':
                const entity = NullEngineManager.CreateEntity(
                  BouncingBall,
                  {
                    name: `Ball ${Date.now()}`,
                    location:{
                      location: SyncedEntityLocation.SERVER,
                      server: wss,
                    },
                    radius: 1,
                    color: Color3.Random().toHexString(),
                    position: Vector3.Zero(),
                    rotation: Vector3.Zero(),
                    scale: Vector3.One(),
                  } as IBouncingBall
                )
                ServerState.entities.push(entity)
              break;
            case 'reset':
                const list = [...ServerState.entities];
                ServerState.entities = [];   
                NullEngineManager.DestroyEntities(list);
                const message = CreateMessage(MessageTypes.DESTROY_ENTITY, {uids: list.map((entity) => entity.uid)}).message;
                SendToAllClients(wss.clients, message);
              break;
            default:
              console.error('Unknown target', target);
          }
          // Send data back to all clients
          SyncServerStateToAllClients(wss);
          break;
        }

        case MessageTypes.ENTITY_UPDATE:{
          const entity = ServerState.entities.find((entity) => entity.uid === message.data.uid);    
          if(entity){
            entity.digestMutations(message.data);
            SendToAllClients(wss.clients, CreateMessage(MessageTypes.ENTITY_UPDATE, {
              ...entity.manifestValues
            }).message);
          }
          break;
        }

        case MessageTypes.SEND_PEER_DATA:{
          const user = ServerState.users.get(uid);
          const response = CreateMessage(MessageTypes.PEER_UPDATE, {
            ...message.data, name: user?.name,
          });
          ServerState.users.forEach((user) => {
            if(user.uid !== uid){
              user.ws.send(response.message);
            }
          });
          break;
        }

        default:
          console.error('Unknown message type', message.type);
      }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    ServerState.users.delete(uid);
    ServerState.connectedUsers--;
    SyncServerStateToAllClients(wss);
  });

  ServerState.connectedUsers++;
  SyncServerStateToAllClients(wss);
});

