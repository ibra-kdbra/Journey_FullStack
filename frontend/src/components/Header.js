import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { MediaQuery } from "../util/MediaQuery";
import { motion } from "framer-motion";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import useDarkMode from "../hooks/useDarkMode";
import { Link } from "react-scroll";

import MobileNav from "./MobileNav";

import resume from "../files/farouq.pdf";
import sparkle_gif from "../images/sparkle_resting_v2_1ff6f6a71f2d298b1a31.gif";

import "../styles/Header.css";

function Header() {
  const [colorTheme, setTheme] = useDarkMode();
  const [darkMode, setDarkMode] = useState(
    colorTheme === "light" ? true : false,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobileDevice = useMediaQuery(MediaQuery.TABLET_MED);

  const headerText = isMobileDevice ? "KC" : "ibra-kdbra";

  const handleMenuClick = () => {
    setMenuOpen((s) => !s);
  };

  const toggleDarkMode = (checked) => {
    setTheme(colorTheme);
    setDarkMode(checked);
  };

  return (
    <motion.div
      className="header_wrapper container relative mx-auto p-6"
      initial={{ opacity: 0, scale: 0.75, y: 200 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
    >
      <div className="container relative z-50 mx-auto flex min-w-full flex-row items-center justify-between">
        <div className="flex rounded-full dark:text-white">
          <ul className="m-2 flex flex-row items-center">
            <li className="mr-2 flex flex-row items-center justify-center md:mr-12">
              <img
                src={sparkle_gif}
                alt="bard sparkle"
                className="bard_sparkle mr-2 inline-block max-w-6 "
              />
              <NavLink
                to="/"
                id="home_nav_item"
                className={({ isActive }) =>
                  (isActive ? " " : "") +
                  "mr-1 inline-block rounded-full py-2 text-2xl transition-all duration-150"
                }
              >
                <span className={menuOpen ? "text-white" : ""}>
                  {headerText}
                </span>
              </NavLink>
            </li>
            <li className="hidden py-2 text-gray-500 lg:inline-block dark:text-gray-400">
              <span className="font-light">Software Engineer</span>
            </li>
          </ul>
        </div>
        <div className="header_right flex flex-row items-center justify-center">
          <ul className="nav_menu flex flex-row">
            <li className="mr-12 hidden md:inline-block">
              <Link
                to="about_scroll"
                activeClass="active"
                spy={true}
                smooth={true}
                offset={0}
                duration={500}
                className="mr-1 cursor-pointer rounded-full py-2 transition-all duration-150"
              >
                About
              </Link>
            </li>
            <li className="mr-12 hidden md:inline-block">
              <Link
                to="footer_scroll"
                activeClass="active"
                spy={true}
                smooth={true}
                offset={0}
                duration={500}
                className="mr-1 cursor-pointer rounded-full py-2 transition-all duration-150"
              >
                Contact
              </Link>
            </li>
            <li className="mr-12 hidden md:inline-block">
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="rounded-full py-2  transition-all duration-150 hover:cursor-pointer"
              >
                Resume{" "}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-4 dark:hidden"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                      fill="#000000"
                    ></path>{" "}
                    <path
                      d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                      fill="#000000"
                    ></path>{" "}
                  </g>
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                  className="hidden w-4 dark:inline-block"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                      fill="#ffffff"
                    ></path>
                  </g>
                </svg>
              </a>
            </li>
            <li>
              <button className="mr-4 rounded-full bg-white p-2 dark:bg-gray-600">
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  size={24}
                />
              </button>
            </li>
            <li className="mt-2 self-center">
              <button
                id="menu-btn"
                className={
                  (menuOpen ? "open " : "") +
                  "hamburger block focus:outline-none md:hidden"
                }
                type="button"
                onClick={handleMenuClick}
              >
                <span className="hamburger-top"></span>
                <span className="hamburger-middle"></span>
                <span className="hamburger-bottom"></span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      {menuOpen && <MobileNav setMenuOpen={setMenuOpen} />}
    </motion.div>
  );
}

export default Header;
