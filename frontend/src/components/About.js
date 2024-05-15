import React from "react";
import { motion } from "framer-motion";
import { Element } from "react-scroll";

const About = () => {
  return (
    <div className="bg-white dark:bg-black" id="about">
      <Element name="about_scroll"></Element>
      <motion.div
        className="container mx-auto flex min-h-screen flex-col justify-around p-6 pt-24 md:mt-48"
        initial={{ opacity: 0, scale: 0.75, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="about_top">
          <motion.p
            className="mb-16 mt-24 text-3xl md:mb-24 md:text-6xl"
            initial={{ opacity: 0, scale: 0.75, y: 200 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
          >
            ibra-kdbra is a Full Stack Software Engineer experienced in
            enterprise development. He is driven by technical challenges and a
            love for collaboration. He aspires to create elegant solutions to
            complex problems.
          </motion.p>
        </div>
        <motion.div
          className="about_bottom flex flex-col justify-between md:flex-row"
          initial={{ opacity: 0, scale: 0.75, y: 200 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="skills mb-24 flex flex-col md:text-2xl lg:flex-row">
            <div className="skills_first mr-12">
              <p className="group">
                <span className="mr-4 inline-block transition-all duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Javascript/Typescript
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                React
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Redux/Undux
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                GraphQL
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Relay
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                HTML5
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Tailwind + CSS
              </p>
            </div>
            <div className="skills_second">
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Python
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Flask
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Nest.js
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Node.js
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Express
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                NoSQL/SQL
              </p>
              <p className="group">
                <span className="mr-4 inline-block transition-all  duration-100 ease-linear group-hover:translate-x-3">
                  →
                </span>
                Git/Mercurial
              </p>
            </div>
          </div>
          <div className="quip text-xl md:max-w-[50%]">
            {" "}
            <strong>When I'm not writing code, you can find me:</strong>{" "}
            <span id="run">pounding the pavement on a jog</span>,{" "}
            <span id="food">
              whipping up something delicious in the kitchen
            </span>
            , <span id="read">diving into a non-fiction book</span>, or{" "}
            <span id="chess">strategizing my next chess move.</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
