import React from "react";
import { motion } from "framer-motion";
import ScrollAnimationCard from "./ScrollAnimationCard";

const SkillsGrid = () => {
  return (
    <div className="bg-white dark:bg-black" id="about">
      <motion.div
        className="container mx-auto flex min-h-screen flex-col justify-around p-6"
        initial={{ opacity: 0, scale: 0.75, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="skills_top">
          <motion.p
            className="mx-auto mb-16 mt-24 text-5xl font-bold sm:text-6xl md:mb-24 lg:p-24 lg:text-8xl"
            initial={{ opacity: 0, scale: 0.75, y: 200 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Here's what you can expect from me...
          </motion.p>
        </div>
        <div className="mt-gr lg:mt-lg mb-md lg:mb-xl mx-auto flex max-w-7xl flex-col flex-wrap gap-5 md:flex-row">
          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(33.33%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="I'll bring experience, big energy and fresh thinking."
            bgColor="rgb(138, 216, 192)"
          />

          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(66.66%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="Listen, challenge and reconnect the dots — joining your team with conviction and openness."
            bgColor="rgb(198, 244, 89)"
          />
          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(50%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="Bridge the gap between frontend and backend — speaking
            both languages."
            bgColor="rgb(243, 154, 142)"
          />
          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(50%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="Recognise potential — pushing teammates to help each other become better than thought possible."
            bgColor="rgb(133, 203, 218)"
          />
          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(58.333%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="Giving you the foundations to scale — from UI development to API design."
            bgColor="rgb(156, 183, 235)"
          />
          <ScrollAnimationCard
            classList="min-h-[350px] w-full rounded-3xl p-[30px] text-3xl font-bold md:w-[calc(41.667%-10px)] md:text-3xl lg:min-h-[400px] lg:p-[50px] lg:text-4xl xl:text-4xl dark:text-black"
            content="Move fast and often — and have a hell of a lot of fun
            doing it."
            bgColor="rgb(178, 149, 206)"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SkillsGrid;
