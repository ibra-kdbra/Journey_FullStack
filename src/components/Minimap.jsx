import {
  Environment,
  Gltf,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { Vector3 } from "three";
import { useSnapshot } from "valtio";
import { GameState } from "../App";
import { maps } from "./Experience";

const tmpVector = new Vector3();

export const Minimap = () => {
  const { map, characterPosition } = useSnapshot(GameState);
  const { autorotateCamera, zoomLevel } = useControls("Minimap 🗺️", {
    autorotateCamera: true,
    zoomLevel: {
      min: 1,
      max: 30,
      value: 12,
    },
  });
  const character = useRef();

  useFrame(({ camera }) => {
    if (characterPosition) {
      tmpVector.set(
        characterPosition.x,
        characterPosition.y + zoomLevel,
        characterPosition.z
      );
      camera.position.copy(tmpVector);
      tmpVector.set(
        characterPosition.x,
        characterPosition.y,
        characterPosition.z
      );
      camera.lookAt(tmpVector);
    }
    if (autorotateCamera) {
      camera.rotation.z = GameState.containerRotation;
    } else {
      camera.rotation.z = 0;
    }
    if (character.current) {
      character.current.rotation.y = camera.rotation.z;
      character.current.position.copy(characterPosition);
    }
  });

  const profileTexture = useTexture("textures/ibra.png");

  return (
    <>
      <color attach={"background"} args={["#ececec"]} />
      <ambientLight intensity={3} />
      <Environment preset="sunset" />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <group ref={character}>
        <mesh renderOrder={1} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            depthTest={false}
            map={profileTexture}
          />
        </mesh>
        <mesh position-y={-0.01} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.65, 32]} />
          <meshBasicMaterial color="red" depthTest={false} />
        </mesh>
      </group>
      <Gltf
        scale={maps[map].scale}
        position={maps[map].position}
        src={`models/${map}.glb`}
      />
    </>
  );
};
