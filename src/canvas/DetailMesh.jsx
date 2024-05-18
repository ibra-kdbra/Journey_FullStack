import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useStore } from '../App';
import { useLocation } from 'react-router-dom';
import { lerp } from '../util/math';

// import vertexDefault from './shaders/detail/vertexDefault';
import vertexWave from './shaders/detail/vertexWave';
import fragmentDefault from './shaders/detail/fragmentDefault';

function DetailMesh({ image }) {
  const meshRef = useRef(null);
  const { textures, isTransition } = useStore();
  const { id, path, src, element } = image;
  // const { pathname } = useLocation();

  useFrame((state) => {
    const { clock } = state;
    const { width, height, top, left } = element.getBoundingClientRect();

    meshRef.current.position.x = left - window.innerWidth / 2 + width / 2;
    meshRef.current.position.y = -top + window.innerHeight / 2 - height / 2;
    meshRef.current.scale.x = width;
    meshRef.current.scale.y = height;

    meshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
    // if (
    //   meshRef.current.material.uniforms.uImageSize.value.x !==
    //   element.naturalWidth
    // ) {
    meshRef.current.material.uniforms.uImageSize.value.set(
      element.naturalWidth,
      element.naturalHeight
    );
    // }
  });

  useEffect(() => {
    const handleResize = () => {
      meshRef.current.material.uniforms.uViewportSize.value.set(
        window.innerWidth,
        window.innerHeight
      );
      meshRef.current.material.uniforms.uPlaneSize.value.set(
        meshRef.current.scale.x,
        meshRef.current.scale.y
      );
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: textures[id] },
      uImageSize: {
        value: new THREE.Vector2(0, 0),
      },
      uPlaneSize: {
        value: new THREE.Vector2(0, 0),
      },
      uViewportSize: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
    }),
    [image.src]
  );

  return (
    <>
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          key={uuidv4()}
          uniforms={uniforms}
          transparent={true}
          // side={THREE.DoubleSide}
          vertexShader={vertexWave}
          fragmentShader={fragmentDefault}
        />
      </mesh>
    </>
  );
}

export default DetailMesh;
