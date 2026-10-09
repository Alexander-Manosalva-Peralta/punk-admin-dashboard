/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#06080B",
          900: "#0A0D12",
          850: "#10141A",
          800: "#151B24",
          700: "#1E2633",
        },
        emerald: {
          neon: "#10B981",
          glow: "rgba(16, 185, 129, 0.15)",
        }
      },
    },
  },
  plugins: [],
};
