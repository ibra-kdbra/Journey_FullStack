import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useStore } from '../App';
import { lerp } from '../util/math';
import { useLocation } from 'react-router-dom';
import { useControls } from 'leva';

import vertexDefault from './shaders/home/vertexDefault';
import vertexDE from './shaders/home/vertexDE';
import fragmentMask from './shaders/home/fragmentMask';

function HomeMesh({ image }) {
  const meshRef = useRef(null);
  const isEnteredRef = useRef(false);
  const mouseRef = useRef({
    viewport: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  });
  const { textures, isTransition } = useStore();
  const { id, path, src, element } = image;

  // const { progress, fadeOut, fadeOutDir, curviness, transition, backface } =
  //   useControls({
  //     progress: { value: 0, min: -1, max: 1 },
  //     // fadeOut: { value: 0, min: -100, max: 100 },
  //     // fadeOutDir: { value: 0, min: 0, max: 1, step: 1 },
  //     // curviness: { value: 0, min: -100, max: 100 },
  //     // transition: { value: 0, min: -100, max: 100 },
  //     // backface: { value: 1, min: 0, max: 1, step: 1 },
  //   });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current.viewport.x = e.clientX;
      mouseRef.current.viewport.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (isTransition) {
      gsap.to(meshRef.current.material.uniforms.uAlpha, {
        value: 0,
        duration: 0.75,
      });
    } else {
      gsap.to(meshRef.current.material.uniforms.uAlpha, {
        value: 1,
        duration: 0.75,
      });
    }
  }, [isTransition]);

  useFrame((state) => {
    const { clock } = state;
    const { width, height, top, left } = element.getBoundingClientRect();

    meshRef.current.position.x = left - window.innerWidth / 2 + width / 2;
    meshRef.current.position.y = -top + window.innerHeight / 2 - height / 2;
    meshRef.current.scale.x = width;
    meshRef.current.scale.y = height;
    meshRef.current.material.uniforms.uPlaneSize.value.set(
      meshRef.current.scale.x,
      meshRef.current.scale.y
    );

    mouseRef.current.current.x = lerp(
      mouseRef.current.current.x,
      mouseRef.current.target.x,
      0.075
    );
    mouseRef.current.current.y = lerp(
      mouseRef.current.current.y,
      mouseRef.current.target.y,
      0.075
    );

    meshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
    // meshRef.current.material.uniforms.uFadeOut = fadeOut;
    // meshRef.current.material.uniforms.uFadeOutDir = fadeOutDir;
    // meshRef.current.material.uniforms.uProgress = progress;
    // meshRef.current.material.uniforms.uCurviness = curviness;
    // meshRef.current.material.uniforms.uTransition = transition;
    // meshRef.current.material.uniforms.uBackFace = backface;

    // console.log('uniforms: ', meshRef.current);

    // if (
    //   meshRef.current.material.uniforms.uImageSize.value.x !==
    //   element.naturalWidth
    // ) {
    meshRef.current.material.uniforms.uImageSize.value = new THREE.Vector2(
      element.naturalWidth,
      element.naturalHeight
    );
    // }

    if (
      mouseRef.current.viewport.x > left &&
      mouseRef.current.viewport.x < left + width &&
      mouseRef.current.viewport.y > top &&
      mouseRef.current.viewport.y < top + height
    ) {
      if (!isEnteredRef.current) {
        isEnteredRef.current = true;
        handleMouseEnter();
      }
    } else {
      if (isEnteredRef.current) {
        isEnteredRef.current = false;
        handleMouseLeave();
      }
    }
    mouseRef.current.target.x = (mouseRef.current.viewport.x - left) / width;
    mouseRef.current.target.y =
      1 - (mouseRef.current.viewport.y - top) / height;
    meshRef.current.material.uniforms.uMouse.value.set(
      mouseRef.current.current.x,
      mouseRef.current.current.y
    );

    // console.log(clock.elapsedTime);
  });

  const handleMouseEnter = () => {
    gsap.to(meshRef.current.material.uniforms.uHovered, {
      value: 1,
      duration: 1,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(meshRef.current.material.uniforms.uHovered, {
      value: 0,
      duration: 1,
    });
  };

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
      // uTexture2: { value: textures['texture2'] },
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
      uAlpha: { value: 0 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uHovered: { value: 0 },
      uFadeOut: { value: 0 },
      uFadeOutDir: { value: 0 },
      uProgress: { value: 0 },
      uCurviness: { value: 0 },
      uTransition: { value: 0 },
      uBackFace: { value: 0 },
    }),
    []
  );

  return (
    <>
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          key={uuidv4()}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          // vertexShader={vertexDefault}
          vertexShader={vertexDE}
          fragmentShader={fragmentMask}
        />
      </mesh>
    </>
  );
}

export default HomeMesh;
