import { useEffect, useState } from 'react';

const scroll = {
  current: 0,
  target: 0,
  ease: 0.075,
  locked: false,
};

const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

function useSmoothScroll(props) {
  const { container } = props;
  const [scrollCurrent, setScrollCurrent] = useState(0);
  const [scrollTarget, setScrollTarget] = useState(0);

  useEffect(() => {
    const smoothScroll = () => {
      if (!scroll.locked) {
        scroll.target = window.scrollY;
        setScrollTarget(scroll.target);
        scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
        setScrollCurrent(scroll.current);
        if (container) {
          container.style.transform = `
          translate3d(0, -${scroll.current}px, 0)
          `;
          document.body.style.height = `${
            container.getBoundingClientRect().height
          }px`;
        }
      } else {
        resetScroll();
      }
      requestAnimationFrame(smoothScroll);
    };
    smoothScroll();

    return () => {
      cancelAnimationFrame(smoothScroll);
      document.body.style.height = '';
    };
  }, [container]);

  const resetScroll = () => {
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    scroll.current = 0;
    scroll.target = 0;
    setScrollCurrent(scroll.current);
    setScrollTarget(scroll.target);
    if (container) {
      container.style.transform = `
        translate3d(0, -${scroll.current}px, 0)
        `;
    }
  };

  const lockScroll = (locked) => {
    scroll.locked = locked;
  };

  return {
    lockScroll,
    resetScroll,
    current: scrollCurrent,
    target: scrollTarget,
  };
}

export default useSmoothScroll;
