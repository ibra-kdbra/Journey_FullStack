import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../App';

function Detail({ title, description, image, id, path }) {
  const { setDetailImages, resetScroll, isTransition, lockScroll } = useStore();

  useEffect(() => {
    resetScroll();
  }, []);

  useEffect(() => {
    isTransition ? lockScroll(true) : lockScroll(false);

    return () => {
      lockScroll(false);
    };
  }, [isTransition]);

  useEffect(() => {
    // get all images from DOM and set them to state for use in canvas scene
    const allImages = [...document.querySelectorAll('.detail__img')];

    const data = [];
    allImages.forEach((image) => {
      const { path, id, src } = image.dataset;

      data.push({
        id,
        path,
        src,
        element: image,
      });
    });

    setDetailImages(data);

    return () => {
      setDetailImages([]);
    };
  }, []);

  return (
    <motion.div
      className="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <div className="detail__itemWrapper">
        <div className="detail__textWrapper">
          <span className="detail__title">{title}</span>
          <span className="detail__description">{description}</span>
        </div>
        <div className="detail__imgWrapper">
          <img
            src={image}
            alt="image"
            className="detail__img"
            data-path={path}
            data-id={id}
            data-src={image}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Detail;
