import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { purple: "#8C00FF", "purple-light": "#B47BFF", "purple-deep": "#4C0A8F", mint: "#C8F31D", "mint-bright": "#DBFF5A" },
        ink: { DEFAULT: "#05060A", soft: "#080A12", panel: "#0C0F1A" },
      },
      fontFamily: { display: ["var(--font-display)", "system-ui", "sans-serif"], body: ["var(--font-body)", "system-ui", "sans-serif"] },
      boxShadow: { "glow-purple": "0 0 50px -8px rgba(140,0,255,0.6)", "glow-mint": "0 0 50px -8px rgba(200,243,29,0.45)", glass: "0 8px 32px rgba(0,0,0,0.5)" },
      animation: { "spin-slow": "spin 18s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
