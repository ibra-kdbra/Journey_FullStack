import { KeyboardControls, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { proxy } from "valtio";
import { Experience } from "./components/Experience";
import { Minimap } from "./components/Minimap";

export const GameState = proxy({
  map: "castle_on_hills",
  characterPosition: new Vector3(0, 0, 0),
  containerRotation: 0,
});

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["Shift"] },
];

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], near: 0.1, fov: 40 }}
        style={{
          touchAction: "none",
        }}
      >
        <View.Port />
      </Canvas>

      <View
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <Experience />
      </View>
      <View
        style={{
          position: "fixed",
          width: "320px",
          height: "320px",
          top: 16,
          left: 16,
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
      >
        <Minimap />
      </View>
    </KeyboardControls>
  );
}

export default App;
