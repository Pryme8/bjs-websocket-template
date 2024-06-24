
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { NullEngine } from "@babylonjs/core/Engines";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "entities/entity";
import { ISyncedEntity, SyncedEntity } from "entities/syncedEntity";
import { EntityManager } from "./entityManager/entityManager";
import { SceneManager } from "./sceneManager/sceneManager";

export class NullEngineManager{
    private static _Instance: NullEngineManager;
    public static get Instance(): NullEngineManager {
        if (!NullEngineManager._Instance) {
            NullEngineManager._Instance = new NullEngineManager();
        }
        return NullEngineManager._Instance;
    }

    private _engine: NullEngine;
    private _scene: Scene;
    private _sceneManager: SceneManager;
    private _entityManager: EntityManager;
    private _serverCamera: FreeCamera;
    public static Scene: Scene;

    private _time: number = 0;
    private _timeSeconds: number = 0;
    private _delta: number = 0;
    private _deltaSeconds: number = 0;

    public static get Time(): number{
        return NullEngineManager.Instance._time;
    }
    public static get TimeSeconds(): number{
        return NullEngineManager.Instance._timeSeconds;
    }
    public static get Delta(): number{
        return NullEngineManager.Instance._delta;
    }
    public static get DeltaSeconds(): number{
        return NullEngineManager.Instance._deltaSeconds;
    }

    constructor(){
        this._engine = new NullEngine();
        this._scene = new Scene(this._engine);
        this._serverCamera = new FreeCamera('serverCamera', new Vector3(0, 0, 0), this._scene);
        this._serverCamera.setTarget(Vector3.One());

        this._sceneManager = new SceneManager({scene: this._scene, engine: this._engine});
        this._entityManager = new EntityManager({scene: this._scene, engine: this._engine});

        this._engine.runRenderLoop(() => {
            this._scene.render(false, true);
            this._delta = this._engine.getDeltaTime();
            this._time += this._delta;
            this._delta = this._delta;
            this._deltaSeconds = this._delta * 0.001;
            this._timeSeconds += this._deltaSeconds;
            this._sceneManager.update(this._delta);
            this._entityManager.update(this._delta);
        });
    } 

    public static CreateEntity(_Entity: any, props: ISyncedEntity){
        return NullEngineManager.Instance._entityManager.spawnEntity(_Entity, props);
    }
    public static DestroyEntities(entities: SyncedEntity[]){
        NullEngineManager.Instance._entityManager.destroyEntities(entities);
    }
}

export const NEM = NullEngineManager;