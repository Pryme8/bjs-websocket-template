export interface IUser {
    uid: string;
    name: string;
    ws: WebSocket;
}
  
export class User implements IUser {
    uid: string;
    name: string;
    ws: WebSocket;
    constructor(uid: string, name: string, ws: WebSocket) {
      this.uid = uid;
      this.name = name;
      this.ws = ws;
    }
    
    public serialize(){
      return {
        uid: this.uid,
        name: this.name,
      }
    }
  }