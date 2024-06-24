import { WebSocketServer } from "ws";
import { Entity, IEntity } from "./entity";

export enum SyncedEntityLocation{
    SERVER = "SERVER",
    CLIENT = "CLIENT",
}

interface ILocationProps{
    location: SyncedEntityLocation;
    server?: WebSocketServer;
    client?: WebSocket;
}

export interface ISyncedEntity extends IEntity{
    location: ILocationProps;
}

export class SyncedEntity extends Entity{
    protected _type: string = "SyncedEntity";
    declare protected _props: ISyncedEntity;
    public get location(): ILocationProps{
        return this._props.location
    }

    protected _manifest: string[] = ["type", "name", "uid"];
    public get manifest(): string[]{
        return this._manifest;
    };
    public get manifestValues(): {[key: string]: any}{
        const manifest: {[key: string]: any} = {};
        this._manifest.forEach((key) => {
            manifest[key] = (this as any)[key];
            manifest[key] = manifest[key]?.serialize ? manifest[key].serialize() : manifest[key]?.asArray ? manifest[key].asArray() : manifest[key].toString();        
        });
        return manifest;
    }
    protected _mutations: string[] = ["name"];
    public get mutations(): string[]{
        return this._mutations;
    };

    constructor(_props: ISyncedEntity){
        super(_props);
    }

    public update(delta: number){}

    public digestMutations(manifest: {[key: string]: any}){}
    
}