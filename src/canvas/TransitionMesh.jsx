import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
// import { useControls } from 'leva';

import { useStore } from '../App';

import vertexDefault from './shaders/transition/vertexDefault';
import vertexWave from './shaders/transition/vertexWave';
import vertexJerez from './shaders/transition/vertexJerez';
import vertexJerezWave from './shaders/transition/vertexJerezWave';
import vertexDE from './shaders/transition/vertexDE';
import vertexDEY from './shaders/transition/vertexDEY';

import fragmentDefault from './shaders/transition/fragmentDefault';
import fragmentBubble from './shaders/transition/fragmentBubble';
import fragmentBubbleSide from './shaders/transition/fragmentBubbleSide';
import fragmentAir from './shaders/transition/fragmentAir';
import fragmentNoise from './shaders/transition/fragmentNoise';

const DURATION = 1;

function TransitionMesh() {
  const {
    transitionImage: image,
    setTransitionImage,
    textures,
    isTransition,
    setIsTransition,
    lockScroll,
  } = useStore();

  // const { progress, fadeOut, fadeOutDir, curviness, transition, backFace } =
  //   useControls({
  //     progress: {
  //       value: 0,
  //       min: -1,
  //       max: 1,
  //     },
  //     fadeOut: {
  //       value: 0,
  //       min: -1,
  //       max: 1,
  //     },
  //     fadeOutDir: {
  //       value: 0,
  //       min: 0,
  //       max: 1,
  //       step: 1,
  //     },
  //     curviness: {
  //       value: 0,
  //       min: -10,
  //       max: 10,
  //     },
  //     transition: {
  //       value: 0,
  //       min: -1,
  //       max: 1,
  //     },
  //     backFace: {
  //       value: 1,
  //       min: 0,
  //       max: 1,
  //       step: 1,
  //     },
  //   });

  const meshRef = useRef(null);
  const isAnimateTransition = useRef(true);
  const { id, path, src, element, bounds } = image[0];
  const boundsRef = useRef(bounds);

  const convertNorm = (progress) => {
    const increasingNorm = progress * 500;
    const decreasingNorm = (1 - progress) * 500;
    return progress <= 0.5 ? increasingNorm : decreasingNorm;
  };

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      if (meshRef.current) {
        meshRef.current.material.uniforms.uImageSize.value.set(
          img.naturalWidth,
          img.naturalHeight
        );
      }
    };
  }, [src]);

  useFrame((state) => {
    const { clock } = state;

    const detailImage = document.querySelector(`.detail__img[data-id="${id}"]`);
    const finalBounds = detailImage?.getBoundingClientRect();

    if (detailImage && isTransition && isAnimateTransition.current) {
      gsap.to(boundsRef.current, {
        width: finalBounds.width,
        height: finalBounds.height,
        top: finalBounds.top,
        left: finalBounds.left,
        duration: DURATION,
      });

      const tl = gsap.timeline({});
      tl.set(meshRef.current.material.uniforms.uCurviness, {
        // value: 0.5,
        value: -0.5,
      });
      tl.set(meshRef.current.material.uniforms.uBackFace, {
        value: 1,
      });
      tl.to(
        meshRef.current.material.uniforms.uProgress,
        {
          value: 1,
          duration: DURATION,
        },
        '<'
      );
      tl.to(
        meshRef.current.material.uniforms.uCurviness,
        {
          value: 0,
          duration: DURATION,
        },
        '<'
      );
      tl.to(meshRef.current.material.uniforms.uCurviness, {
        value: 0,
        duration: DURATION / 2,
      });
      // meshRef.current.material.uniforms.uProgress.value = progress;
      // meshRef.current.material.uniforms.uFadeOut.value = fadeOut;
      // meshRef.current.material.uniforms.uFadeOutDir.value = fadeOutDir;
      // meshRef.current.material.uniforms.uCurviness.value = curviness;
      // meshRef.current.material.uniforms.uTransition.value = transition;
      // meshRef.current.material.uniforms.uBackFace.value = backFace;
      isAnimateTransition.current = false;
    }
    if (
      Math.abs(boundsRef.current.width - finalBounds.width) < 1 &&
      Math.abs(boundsRef.current.height - finalBounds.height) < 1 &&
      Math.abs(boundsRef.current.top - finalBounds.top) < 1 &&
      Math.abs(boundsRef.current.left - finalBounds.left) < 1 &&
      isTransition
    ) {
      setIsTransition(false);
      setTransitionImage([]);
    }

    meshRef.current.position.x =
      boundsRef.current.left -
      window.innerWidth / 2 +
      boundsRef.current.width / 2;
    meshRef.current.position.y =
      -boundsRef.current.top +
      window.innerHeight / 2 -
      boundsRef.current.height / 2;
    meshRef.current.scale.x = boundsRef.current.width;
    meshRef.current.scale.y = boundsRef.current.height;

    meshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
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
      // uTexture: { value: textures['texture2'] },
      uDisplacement: {
        value: textures['displacement'],
      },
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
      uProgress: { value: 0 },
      uFadeOut: { value: 0 },
      uFadeOutDir: { value: 0 },
      uCurviness: { value: 0 },
      uTransition: { value: 0 },
      uBackFace: { value: 0 },
    }),
    [image.src]
  );

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          key={uuidv4()}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          // vertexShader={vertexDEY}
          vertexShader={id % 2 === 0 ? vertexDEY : vertexDE}
          fragmentShader={fragmentDefault}
          // fragmentShader={fragmentNoise}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </>
  );
}

export default TransitionMesh;
