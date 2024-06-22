import express from 'express';
import { WebSocketServer } from 'ws';
import { CreateMessage, MessageTypes, ParseMessage } from '../shared/message';
import { Server } from 'http';

// Initialize an Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from a directory (optional)
app.use(express.static('public'));

// Create an HTTP server from the Express app
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: any) => {
  console.log('Client connected');

  ws.on('message', async (buffer: Buffer) => {   
      console.log('Received binary data');
      const message = ParseMessage(buffer);
      console.log('Received:', message);
      // Further processing...
      switch (message.type) {
        case MessageTypes.GET_SERVER_DATA:
          // Send data back to client
          ws.send(
            CreateMessage(MessageTypes.SEND_SERVER_DATA, {
              ...ServerState,
            })
          );
          break;
        case MessageTypes.UPDATE_SERVER_DATA:{
          const target = message.data?.target;
          switch(target){
            case 'countUp':
              ServerState.count++
              break;
            case 'reset':
              ServerState.count = 0;
              break;
            default:
              console.error('Unknown target', target);
          }
          // Send data back to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                CreateMessage(MessageTypes.SEND_SERVER_DATA, {
                  ...ServerState,
                })
              );
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
    ServerState.connectedUsers--;
  });

  ServerState.connectedUsers++;
});

interface IServerState {
  connectedUsers: number;
  count: number;
}

const ServerState: IServerState = {
  connectedUsers: 0,
  count: 0,
};

