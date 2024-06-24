import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { EntityClassMap } from "../../../shared/entities/entities";
import { SyncedEntity, SyncedEntityLocation } from "../../../shared/entities/syncedEntity";
import { createContext, FC, useContext, useEffect, useRef, useState } from "react";
import { IDefaultComponentProps } from "../../interfaces/interfaces";
import { BabylonInputManager } from "./input/BabylonInputManager";

let entities: {[key:string]: SyncedEntity} = {};

interface BabylonContextType {
  scene: Scene | null;
  engine: Engine | null;
  entities: { [key: string]: SyncedEntity };
  entityUpdate: (message: any, client: WebSocket) => void;
  destroyEntities: (uids: string[]) => void;
}

const BabylonContext = createContext<BabylonContextType>({
  scene: null,
  engine: null,
  entities: {},
  entityUpdate: () => {},
  destroyEntities: () => {},
});

export const useBabylon = () => useContext(BabylonContext);

interface IBabylonProviderProps extends IDefaultComponentProps{}

const BabylonProvider: FC<IBabylonProviderProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  let entities: { [key: string]: SyncedEntity } = {};
  
  const entityUpdate = (message: any, client: WebSocket) => {
      if(scene){
          if(!entities[message.uid]){
            const _Entity = EntityClassMap.get(message.type);
            const entity = new _Entity({
              uid: message.uid,
              name: message.name, 
              location:{
              location: SyncedEntityLocation.CLIENT,
              client: client,
            }});
            entities[message.uid] = entity;
            entity.digestMutations(message);            
          }else{
            const entity = entities[message.uid];
            entity.digestMutations(message);
          }  
      }
    }

  const destroyEntities = (uids: string[]) => {
    console.log(`Destroying entities: ${uids}`);
    if (scene) {
      uids.forEach((uid) => {
        if (entities[uid]) {
          entities[uid].destroy();
          delete entities[uid];
        }
      });
    }
  }   

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);
      setEngine(engine);
      setScene(scene);

      BabylonInputManager.Initialize(scene);
      
      new HemisphericLight("light", new Vector3(1, 1, 0), scene);

      const defaultCamera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
      defaultCamera.setTarget(Vector3.Zero());

      engine.runRenderLoop(() => {
        scene.render();
      });

      window.addEventListener('resize', () => {
        engine.resize();
      });

      // Cleanup function to dispose of the engine when the component unmounts
      return () => {
        Object.values(entities).forEach((entity) => {
          entity.destroy();
        });     
        engine.dispose();
      };
    }
  }, []);

  // Render the canvas element and attach the canvasRef to it
  return (
    <BabylonContext.Provider value={{ scene, engine, entities, entityUpdate, destroyEntities }}>
      {children}
      <canvas ref={canvasRef} className="bjs-canvas pointerEventsOn" style={{ zIndex: -1 }} />
    </BabylonContext.Provider>
  );
};

export default BabylonProvider;
