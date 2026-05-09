import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0b09",
        surface: "#131210",
        card: "#1a1815",
        card2: "#211f1b",
        border: "#2c2925",
        border2: "#3a3630",
        gold: {
          DEFAULT: "#c9a84c",
          hover: "#e8c97a",
          dim: "rgba(201,168,76,0.10)",
          border: "rgba(201,168,76,0.25)",
        },
        red: {
          DEFAULT: "#c94c4c",
          dim: "rgba(201,76,76,0.10)",
        },
        green: {
          DEFAULT: "#4cad7a",
          dim: "rgba(76,173,122,0.10)",
          border: "rgba(76,173,122,0.25)",
        },
        blue: {
          DEFAULT: "#4c82c9",
          dim: "rgba(76,130,201,0.10)",
        },
        amber: {
          DEFAULT: "#c97d4c",
          dim: "rgba(201,125,76,0.10)",
        },
        txt: "#f0ece4",
        txt2: "#9a9488",
        txt3: "#5c5850",
        disc: {
          d: "#c94c4c",
          i: "#c9a84c",
          s: "#4cad7a",
          c: "#4c82c9",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      animation: {
        fadeDown: "fadeDown 0.6s ease both",
        fadeUp: "fadeUp 0.7s ease both",
        slideLeft: "slideLeft 0.25s ease both",
      },
      keyframes: {
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
