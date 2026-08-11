import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      tablet: "768px",
      desktop: "1024px",
    },
    extend: {
      colors: {
        "forest-green": "#0B2F26",
        obsidian: "#080A09",
        ivory: "#F3F0E7",
        "champagne-gold": "#C8A96B",
        "secondary-green": "#1C4A3B",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        h1: ["50px", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["38px", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        h4: ["21px", { lineHeight: "1.4", fontWeight: "500" }],
        // Tablet-specific heading sizes (min 24px per Req 5.2)
        "h4-tablet": ["24px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        section: "24px",
      },
      backdropBlur: {
        xs: "4px",
        glass: "12px",
        "glass-heavy": "16px",
      },
      borderRadius: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.25)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.35)",
        elevated: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".backdrop-blur-glass": {
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
        },
        ".backdrop-blur-glass-heavy": {
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
        },
        ".bg-glass-forest": {
          background: "rgba(11, 47, 38, 0.25)",
        },
        ".bg-glass-obsidian": {
          background: "rgba(8, 10, 9, 0.6)",
        },
        ".bg-glass-secondary": {
          background: "rgba(28, 74, 59, 0.15)",
        },
        ".border-glass": {
          border: "1px solid rgba(243, 240, 231, 0.12)",
        },
        ".border-glass-subtle": {
          border: "1px solid rgba(243, 240, 231, 0.08)",
        },
      });
    }),
  ],
};

export default config;
