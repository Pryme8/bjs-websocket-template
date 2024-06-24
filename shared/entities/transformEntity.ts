import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ISyncedEntity, SyncedEntity } from "./syncedEntity";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export interface ITransformEntity extends ISyncedEntity{
    position?: Vector3;
    rotation?: Vector3;
    scale?: Vector3;
    parent?: TransformNode;
}

export class TransformEntity extends SyncedEntity{
    protected _type: string = "TransformEntity";
    declare protected _props: ITransformEntity;
    private _transformNode: TransformNode;
    public get transformNode(): TransformNode{
        return this._transformNode;
    }

    public set position(value: Vector3){
        this._transformNode.position = value;
    }
    public get position(): Vector3{
        return this._transformNode.position;
    }
    public set rotation(value: Vector3){
        if(this.transformNode.rotationQuaternion){
            this.transformNode.rotationQuaternion = Quaternion.RotationYawPitchRoll(value.y, value.x, value.z);
        }else{
            this.transformNode.rotation = value;        
        }
    }
    public get rotation(): Vector3 | Quaternion{
        if(this.transformNode.rotationQuaternion){
            return this.transformNode.rotationQuaternion;
        }else{
            return this.transformNode.rotation;        
        }
    }
    public set scale(value: Vector3){
        this._transformNode.scaling = value;
    }
    public get scale(): Vector3{
        return this._transformNode.scaling;
    }

    protected _manifest: string[] = ["type", "uid", "name", "position", "rotation", "scale"];
    protected _mutations: string[] = ["name", "position", "rotation", "scale"];
    constructor(_props: ITransformEntity){
        super(_props);
        this._transformNode = new TransformNode(_props.name);
        this._transformNode.parent = _props.parent ?? null; 
        this.position = _props.position ?? Vector3.Zero();
        this.rotation = _props.rotation ?? Vector3.Zero();     
        this.scale = _props.scale ?? Vector3.One();   
    }

    public update(delta: number){
        super.update(delta);
    }

    public digestMutations(mutations: {[key: string]: any}){
        this.name = mutations.name ?? this.name;
        if(mutations.position){
            this.position = Vector3.FromArray(mutations.position);
        }
        if(mutations.rotation){
            this.rotation = Vector3.FromArray(mutations.rotation);
        }
        if(mutations.scale){
            this.scale = Vector3.FromArray(mutations.scale);
        }
    }
}