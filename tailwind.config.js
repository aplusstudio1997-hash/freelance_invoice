module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        peach: {
          50: "#fff8f3",
          100: "#fff0e3",
          200: "#ffe0c8",
          300: "#ffcca5",
          400: "#ffb482",
          500: "#ff9a5e",
        },
        ink: {
          50: "#f5f5f4",
          100: "#e7e5e4",
          200: "#d6d3d1",
          400: "#78716c",
          600: "#44403c",
          800: "#1c1917",
          900: "#0c0a09",
        },
      },
      fontFamily: {
        sans: [
          "Sarabun",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "peach-radial":
          "radial-gradient(circle at 80% 0%, #ffd9b8 0%, #fff4e8 35%, #fffaf3 70%, #ffffff 100%)",
        "peach-soft":
          "linear-gradient(135deg, #fff8f3 0%, #ffeada 50%, #ffd9b8 100%)",
        "hero-glow":
          "radial-gradient(ellipse at top right, rgba(251, 146, 60, 0.18), transparent 60%), radial-gradient(ellipse at bottom left, rgba(255, 204, 165, 0.25), transparent 55%)",
      },
      boxShadow: {
        soft: "0 6px 20px -8px rgba(234, 88, 12, 0.18)",
        "soft-lg": "0 18px 40px -16px rgba(234, 88, 12, 0.22)",
        glow: "0 10px 30px -10px rgba(251, 146, 60, 0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
