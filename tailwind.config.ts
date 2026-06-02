import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f3ea",
        panel: "#fffdf8",
        ink: "#1d1b16",
        muted: "#6f6759",
        line: "#ded5c6",
        accent: "#2f6f5e",
        "accent-soft": "#e2f0eb",
        "warning-soft": "#fff4d6"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(29, 27, 22, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
