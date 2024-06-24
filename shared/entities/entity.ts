import { Scene } from "@babylonjs/core/scene";

export interface IEntity{
    name: string;
    uid?: string;
    scene: Scene;
}

export class Entity{    
    private _uid: string;
    public get uid(): string{
        return this._uid;
    }
    public get name(): string{
        return this._props.name;
    }
    public set name(value: string){
        this._props.name = value;
    }
    protected _type: string = "Entity";
    public get type(): string{
        return this._type
    }
    public get scene(): Scene{
        return this._props.scene
    }
    constructor(protected _props: IEntity){
        this._uid = _props.uid ?? crypto.randomUUID();
    }
    public update(delta: number){}
    public destroy(){}
}