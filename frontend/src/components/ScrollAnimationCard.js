import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ScrollAnimationCard = ({ classList, content, bgColor }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);

  return (
    <motion.h2
      style={{
        backgroundColor: bgColor,
        opacity: opacity,
        scale: scale,
      }}
      ref={ref}
      className={classList}
    >
      {content}
    </motion.h2>
  );
};

export default ScrollAnimationCard;
