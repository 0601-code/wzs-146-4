/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rail: {
          50: "#f5f7fa",
          100: "#e4e9f0",
          200: "#c7d2e0",
          300: "#9db0c8",
          400: "#6b86a8",
          500: "#4a698e",
          600: "#385274",
          700: "#2d425e",
          800: "#1a2a3a",
          900: "#0f1a26",
          950: "#081018",
        },
        copper: {
          50: "#faf5ee",
          100: "#f3e6d3",
          200: "#e6caa5",
          300: "#d9ae77",
          400: "#cc9249",
          500: "#d4a574",
          600: "#b88a58",
          700: "#936b43",
          800: "#6e4f32",
          900: "#493321",
        },
        signal: {
          red: "#c0392b",
          green: "#27ae60",
          yellow: "#f39c12",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        rail: "0 4px 20px -2px rgba(26, 42, 58, 0.3)",
        copper: "0 4px 20px -2px rgba(212, 165, 116, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
