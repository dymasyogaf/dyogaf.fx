import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./composables/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Segoe UI", "sans-serif"]
      },
      colors: {
        base: {
          950: "#0b0f14",
          900: "#121822",
          800: "#1b2433",
          700: "#2a364b",
          600: "#3a4b68",
          500: "#546a8e"
        },
        brand: {
          500: "#67d4a6",
          600: "#4cc291",
          700: "#32a778"
        },
        warn: {
          500: "#f4b740",
          600: "#e2a62c"
        },
        danger: {
          500: "#f36a6a",
          600: "#de4f4f"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(103, 212, 166, 0.15), 0 20px 60px rgba(8, 12, 18, 0.4)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
