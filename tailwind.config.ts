import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFFAE8",
          100: "#FFF3C4",
          200: "#FFE68A",
          300: "#FFD94F",
          400: "#FFC929",
          500: "#F5B800",
          600: "#D89A00",
          700: "#B07700",
          800: "#8A5A00",
          900: "#5E3D00",
        },
        ink: {
          DEFAULT: "#1B1B1F",
          muted: "#5F6169",
          soft: "#94969E",
        },
      },
      boxShadow: {
        card: "0 18px 50px -20px rgba(66, 48, 0, 0.28)",
        soft: "0 8px 24px -12px rgba(27, 27, 31, 0.25)",
      },
      keyframes: {
        "modal-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "modal-in": "modal-in 0.3s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
