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
        apple: {
          bg: "#F5F5F7",
          card: "#FFFFFF",
          surface: "#FBFBFD",
          border: "#E5E5EA",
          borderSubtle: "#F2F2F7",
          dark: "#1D1D1F",
          secondary: "#6E6E73",
          muted: "#86868B",
          blue: "#0071E3",
          blueHover: "#0077ED",
          green: "#34C759",
          orange: "#FF9500",
          purple: "#AF52DE",
          red: "#FF3B30",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        appleElevated: "0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
