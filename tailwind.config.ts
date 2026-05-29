import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0071e3",
        "accent-hover": "#0077ed",
        "accent-active": "#006edb",
        "text-primary": "#1d1d1f",
        "text-secondary": "#6e6e73",
        "text-muted": "#86868b",
        surface: "#ffffff",
        "surface-2": "#f5f5f7",
        "border-default": "#d2d2d7",
        "border-light": "#e8e8ed",
        green: "#34a853",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "980px",
      },
      boxShadow: {
        "soft-sm": "0 2px 12px rgba(0,0,0,0.05)",
        "soft-md": "0 4px 24px rgba(0,0,0,0.06)",
        "soft-lg": "0 30px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
