import React, { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

import Scene from './Scene';

const PERSPECTIVE = 1000;
const FAR = PERSPECTIVE * 3;
const FOV =
  (180 * (2 * Math.atan(window.innerHeight / 2 / PERSPECTIVE))) / Math.PI;

function GLCanvas() {
  const cameraRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      // update camera fov
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.fov =
        (180 * (2 * Math.atan(window.innerHeight / 2 / PERSPECTIVE))) / Math.PI;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Canvas>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 0, PERSPECTIVE]}
        zoom={1}
        fov={FOV}
        aspect={window.innerWidth / window.innerHeight}
        near={0.01}
        far={FAR}
      />
      <Suspense fallback={<span>loading...</span>}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

export default GLCanvas;
