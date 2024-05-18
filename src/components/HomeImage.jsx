import React, { useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import { useStore } from '../App';

function HomeImage({ item }) {
  const { setTransitionImage, setIsTransition } = useStore();

  const imageRef = useRef(null);
  const navigate = useNavigate();

  return (
    <li className="home__item">
      <div
        className="home__itemLink"
        onClick={() => {
          setIsTransition(true);
          const bounds = imageRef.current.getBoundingClientRect();
          setTransitionImage([
            {
              id: item.id,
              path: item.path,
              src: item.image,
              element: imageRef.current,
              bounds: {
                width: bounds.width,
                height: bounds.height,
                top: bounds.top,
                left: bounds.left,
              },
            },
          ]);
          navigate(`/detail/${item.path}`);
        }}
      >
        <div className="home__itemImgWrapper">
          <img
            ref={imageRef}
            src={item.image}
            alt="image"
            className="home__itemImg"
            data-path={item.path}
            data-id={item.id}
            data-src={item.image}
          />
        </div>
        <div className="home__itemTextWrapper">
          <span className="home__itemTitle">{item.title}</span>
          <span className="home__itemDescription">{item.description}</span>
        </div>
      </div>
    </li>
  );
}

export default HomeImage;
