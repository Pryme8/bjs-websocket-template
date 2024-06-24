import { KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";

interface IBabylonInputManager{
    scene: Scene;
    canvas: HTMLCanvasElement;
}

export enum InputNames{
    Up,
    Down,
    Left,
    Right,
    Jump,
    Shoot
}

export class BabylonInputManager{    
    public static _Scene: Scene

    private static _KeyMap: Map<string, number> = new Map<string, number>([
        ["KeyW", InputNames.Up],
        ["ArrowUp", InputNames.Up],
        ["KeyS", InputNames.Down],
        ["ArrowDown", InputNames.Down],
        ["KeyA", InputNames.Left],
        ["ArrowLeft", InputNames.Left],
        ["KeyD", InputNames.Right],
        ["ArrowRight", InputNames.Right],
        ["KeyK", InputNames.Jump],
        ["Space", InputNames.Jump],
        ["KeyJ", InputNames.Shoot],
        ["ShiftLeft", InputNames.Shoot]
    ])

    private static _InputMap: Map<number, boolean> = new Map<number, boolean>([
        [InputNames.Up, false],
        [InputNames.Down, false],
        [InputNames.Left, false],
        [InputNames.Right, false],
        [InputNames.Jump, false],
        [InputNames.Shoot, false]
    ])

    public static get InputMap(): Map<number, boolean>{
        return BabylonInputManager._InputMap;
    }

    public static GetInput(inputName: InputNames): boolean{
        return BabylonInputManager.InputMap.get(inputName) ?? false;
    }

    public static Initialize(scene: Scene, _canvas?: HTMLCanvasElement){
        BabylonInputManager._Scene = scene
        BabylonInputManager.IsEnabled = true
    }
    private static _InputObs: Observer<KeyboardInfo>
    private static _Enabled: boolean = false
    public static get IsEnabled(): boolean{
        return BabylonInputManager._Enabled
    }
    public static set IsEnabled(enabled: boolean){
        BabylonInputManager._Enabled = enabled
        if(!enabled){
            BabylonInputManager._Scene.onKeyboardObservable.remove(BabylonInputManager._InputObs)
            BabylonInputManager._InputMap.forEach((value, key)=>{
                BabylonInputManager._InputMap.set(key, false)
            })
        }else{
            if(BabylonInputManager._Scene){
                BabylonInputManager._InputObs = BabylonInputManager._Scene.onKeyboardObservable.add((eventData: KeyboardInfo)=>{
                    if(BabylonInputManager.IsEnabled){
                        if(BabylonInputManager._KeyMap.has(eventData.event.code)){
                            const setter = BabylonInputManager._KeyMap.get(eventData.event.code);
                            if(setter != undefined){
                                if(eventData.type == 1){
                                    BabylonInputManager._InputMap.set(setter, true)                    
                                }else{
                                    BabylonInputManager._InputMap.set(setter, false)
                                }
                            }
                        }
                    }
                })
            }
        }
    }
}