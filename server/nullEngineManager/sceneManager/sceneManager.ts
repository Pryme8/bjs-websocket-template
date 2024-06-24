import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";


export interface ISceneManager{
    scene: Scene
    engine: Engine
}

export class SceneManager{
    public get scene(): Scene{
        return this._props.scene;
    }
    public get engine(): Engine{
        return this._props.engine;
    }
    
    constructor(private _props: ISceneManager){}

    public update(delta: number){}
}