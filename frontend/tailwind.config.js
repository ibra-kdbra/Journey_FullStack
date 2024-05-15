/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f4fbf7",
        primaryBgGray: "rgb(243, 242, 243)",
        // primaryDark: "#000",
        primaryDark: "#111",
        btnActive: "rgba(0, 0, 0, 0.05)",
        btnHover: "rgba(0, 0, 0, 0.05)",
        btnResumeHover: "rgb(245, 245, 245)",
        btnActiveDark: "rgba(200, 200, 200, 1)",
        btnHoverDark: "rgba(200, 200, 200, 1)",
        btnResumeHoverDark: "rgba(200, 200, 200, 1)",
      },
    },
  },
  plugins: [],
};
