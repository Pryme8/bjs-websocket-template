import { Engine, Scene } from "@babylonjs/core"
import { ISyncedEntity, SyncedEntity } from "entities/syncedEntity";
import { CreateMessage, MessageTypes } from "../../../shared/message";


export interface IEntityManager{
    scene: Scene
    engine: Engine
}

export class EntityManager{
    public get scene(): Scene{
        return this._props.scene;
    }
    public get engine(): Engine{
        return this._props.engine;
    }

    public entities: SyncedEntity[] = [];

    constructor(private _props: IEntityManager){}

    public spawnEntity(_Entity: any, props: ISyncedEntity){
        // Spawn entity
        const entity: SyncedEntity = new _Entity({...props, scene: this.scene});
        console.log(`Entity spawned: ${entity.name}`)
        this.entities.push(entity);
        console.log(`Entities: ${this.entities.length}`)
        if(entity.location.server){
            entity.location.server.clients.forEach((client) => {
                const message = CreateMessage(MessageTypes.ENTITY_UPDATE, {
                    ...entity.manifestValues,
                }).message;
                client.send(message);
            });
        }
        return entity;
    }

    public destroyEntities(entities: SyncedEntity[]){
        entities.forEach((entity) => {
            entity.destroy();
            this.entities = this.entities.filter((e) => e.uid !== entity.uid);
        });
    }

    public update(delta: number){
        this.entities.forEach((entity) => {
            entity.update(delta);
        });
    }
}