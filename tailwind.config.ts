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
        mundial: {
          base: "#060D1A",
          surface: "#0D1B2A",
          elevated: "#132236",
          green: "#22C55E",
          gold: "#FBBF24",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        russo: ["var(--font-russo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
