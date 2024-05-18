import React, { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

import useSmoothScroll from './hooks/useSmoothScroll';

import { create } from 'zustand';

import ViewRoutes from './ViewRoutes';
import Header from './components/Header';
import GLCanvas from './canvas/GLCanvas';

import displacementMap from './assets/images/disp1.jpg';
import texture2 from './assets/images/img19.jpeg';

import './App.css';

import DATA from './data';

// create zustand store
export const useStore = create((set) => ({
  homeImages: [],
  setHomeImages: (homeImages) => set({ homeImages }),
  detailImages: [],
  setDetailImages: (detailImages) => set({ detailImages }),
  isTransition: false,
  setIsTransition: (isTransition) => set({ isTransition }),
  transitionImage: [],
  setTransitionImage: (transitionImage) => set({ transitionImage }),
  textures: {},
  setTextures: (textures) => set({ textures }),
  lockScroll: () => {},
  setLockScroll: (lockScroll) => set({ lockScroll }),
  resetScroll: () => {},
  setResetScroll: (resetScroll) => set({ resetScroll }),
}));

function App() {
  const scrollableRef = useRef(null);
  const { setTextures, setLockScroll, setResetScroll } = useStore();

  const { resetScroll, lockScroll, current, target } = useSmoothScroll({
    container: scrollableRef.current,
  });

  useEffect(() => {
    setLockScroll(lockScroll);
    setResetScroll(resetScroll);
  }, []);

  useEffect(() => {
    // cache all WebGL textures
    const inputTextures = [
      ...DATA,
      { id: 'displacement', image: displacementMap },
      { id: 'texture2', image: texture2 },
    ];
    const outputTextures = {};
    // cache textures
    inputTextures.forEach(({ id, image }) => {
      const texture = new THREE.TextureLoader().load(image);
      outputTextures[id] = texture;
    });
    setTextures(outputTextures);
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence>
        <main className="main">
          <div className="canvasWrapper">
            <GLCanvas />
          </div>
          <Header />
          <div ref={scrollableRef} className="scrollable">
            <ViewRoutes />
          </div>
        </main>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
