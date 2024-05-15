import React from "react";

import { motion } from "framer-motion";
import { Link, Element } from "react-scroll";

import kc_dark from "../images/kc_dark.png";
import kc_light from "../images/kc_light.png";
import resume from "../files/farouq.pdf";

const Footer = () => {
  return (
    <div
      className="relative mx-auto flex min-h-screen w-screen items-center bg-black text-white dark:bg-white dark:text-black"
      id="footer"
    >
      <Element name="footer_scroll"></Element>
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 200 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto flex h-full flex-col justify-around p-6 pb-20"
      >
        <div className="footer_top mb-24 mt-12">farouq
          <p className="text-4xl md:max-w-[40%]">
            Let's create something memorable and timeless together.
          </p>
          <img src={kc_dark} alt="kc" className="mt-6 hidden w-36 dark:block" />
          <img
            src={kc_light}
            alt="kc"
            className="mt-6 block w-36 dark:hidden"
          />
        </div>
        <div className="footer_links">
          <h3 className="mb-8 text-2xl">Links</h3>
          <div className="footer_bottom flex flex-col md:flex-row">
            <div className="links mr-24">
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                Resume
                <span className="ml-2 inline-block transition-all duration-100 ease-linear group-hover:translate-x-2">
                  →
                </span>
              </a>
              <p className="mb-8 text-slate-400">Read my CV</p>
              <a
                href="https://www.linkedin.com/in"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                LinkedIn
                <span className="ml-2 inline-block transition-all duration-100 ease-linear group-hover:translate-x-2">
                  →
                </span>
              </a>
              <p className="mb-8 text-slate-400">Connect with me on LinkedIn</p>
            </div>
            <div className="links">
              <a
                href="https://github.com/ibra-kdbra"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                Github
                <span className="ml-2 inline-block transition-all duration-100 ease-linear group-hover:translate-x-2">
                  →
                </span>
              </a>
              <p className="mb-8 text-slate-400">Where I share projects</p>
              <a href="sonarfarouq@gmail.com" className="group">
                Contact Me
                <span className="ml-2 inline-block transition-all duration-100 ease-linear group-hover:translate-x-2">
                  →
                </span>
              </a>
              <p className="mb-8 text-slate-400">Get in touch with me</p>
            </div>
          </div>
          <div className="links">
            <p className="text-slate-400">sonarfarouq@gmail.com</p>
            <a className="mb-8 text-slate-400" href="https://t.me/Ibra_22kh">ibra-kdbra@telegram</a>
            <div className="relative">
              <div className="inline-block h-3 w-3 rounded-full bg-green-400"></div>
              <div className="-ml-3  mr-4 inline-block h-3 w-3 animate-ping rounded-full bg-green-400"></div>
              <p className="inline-block">
                Currently open to new opportunities
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="absolute bottom-8 right-8 md:right-12">
        <Link
          to="top_scroll"
          activeClass="active"
          spy={true}
          smooth={true}
          offset={0}
          duration={500}
          className="group mr-1 cursor-pointer rounded-full py-2 transition-all duration-150"
        >
          Top{" "}
          <span className="duration-50 inline-block transition-all ease-linear group-hover:-translate-y-1">
            👆
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
