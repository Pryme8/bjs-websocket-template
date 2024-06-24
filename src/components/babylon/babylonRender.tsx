import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { EntityClassMap } from "../../../shared/entities/entities";
import { SyncedEntity, SyncedEntityLocation } from "../../../shared/entities/syncedEntity";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

let entities: {[key:string]: SyncedEntity} = {};

const BabylonRender = forwardRef((props, ref) => {
  // Initialize the canvasRef with useRef hook
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);

  useImperativeHandle(ref, () => ({
    entityUpdate: (message: any, client: WebSocket) => {
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
    },
    destroyEntities: (uids: string[]) => {
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
    // You can expose more functions here
  }));

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);
      setScene(scene);
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
  return <canvas ref={canvasRef} className="pointerEventsOn" style={{ width: '100%', height: '100vh' }} />;
});

export default BabylonRender;
