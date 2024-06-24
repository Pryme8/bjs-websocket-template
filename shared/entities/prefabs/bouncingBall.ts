
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ITransformEntity, TransformEntity } from "../transformEntity";
import { SyncedEntityLocation } from "../syncedEntity";
import { CreateMessage, MessageTypes } from "../../../shared/message";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { NEM } from "../../../server/nullEngineManager/nullEngineManager";
import { Observable, Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import "@babylonjs/core/Culling/ray";


export interface IBouncingBall extends ITransformEntity{
    radius: number;
    color: string;
}
export class BouncingBall extends TransformEntity{
    protected _type: string = "BouncingBall";
    private _material: StandardMaterial;
    public get color(): Color3{
        return this._material.diffuseColor;
    }
    public set color(value: Color3){
        this._material.diffuseColor = value;
    }

    private _sphere: AbstractMesh; 
    private _updateObservable!: Observer<Scene>;   

    protected _manifest: string[] = ["type", "uid", "name", "position", "rotation", "scale", "color"];
    protected _mutations: string[] = ["name", "position", "rotation", "scale", "color"];
    constructor(_props: IBouncingBall){
        super(_props);
        const sphere: AbstractMesh = CreateSphere(_props.name, {diameter: _props.radius * 2}, this.scene);
        sphere.parent = this.transformNode;
        sphere.position = Vector3.Zero();
        sphere.rotation = Vector3.Zero();
        sphere.scaling = Vector3.One();
        this._sphere = sphere;
        const material = new StandardMaterial("material", this.scene);
        material.diffuseColor = Color3.FromHexString(_props.color ?? "#FFFFFF");
        sphere.material = material 
        this._material = material;        
        this._handleLocation();
    }

    private _handleLocation(){
        if(this.location.location === SyncedEntityLocation.SERVER){
            let timeOffset = Math.random() * 1000;
            this.position.x = Math.cos(NEM.Time + timeOffset) * 2;
            this._updateObservable = this.scene.onBeforeRenderObservable.add(() => {
                const y = Math.sin(NEM.TimeSeconds + timeOffset);             
                this.position.y = y * 3;
                if(this.location.server){
                    this.location.server.clients.forEach((client) => {
                        const message = CreateMessage(MessageTypes.ENTITY_UPDATE, {
                            ...this.manifestValues,
                        }).message;
                        client.send(message);
                    });
                }
            });            
        }else if(this.location.location === SyncedEntityLocation.CLIENT){       
            const actionManager = new ActionManager(this.scene);
            actionManager.registerAction(
                new ExecuteCodeAction({
                    trigger: ActionManager.OnPickTrigger
                }, ()=>{              
                    this.location.client?.send(
                        CreateMessage(MessageTypes.ENTITY_UPDATE, {
                            uid: this.uid,
                            color: Color3.Random().asArray(),
                        }).message
                    )
                })
            );
            this._sphere.isPickable = true;
            this._sphere.actionManager = actionManager;
            console.log(`Created action manager for ${this.name}`);
        }
    }

    public digestMutations(manifest: {[key: string]: any}){
        super.digestMutations(manifest);
        this.color = Color3.FromArray(manifest.color);
    }

    public destroy(){
        if(this.location.location === SyncedEntityLocation.SERVER){
            this.scene.onBeforeRenderObservable.remove(this._updateObservable);
        }
        console.log(`Destroying ${this.name} on ${this.location.location}`);
        this.transformNode.dispose(false, true);
    }
}