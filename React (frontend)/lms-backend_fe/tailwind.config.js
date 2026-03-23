/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f4",
          100: "#daf0e4",
          200: "#b8e2cb",
          300: "#8ccfaa",
          400: "#56b57e",
          500: "#2b965d",
          600: "#1f7749",
          700: "#1b5f3d",
          800: "#184c33",
          900: "#153f2b",
        },
        accent: {
          50: "#fff9ed",
          100: "#fff1d3",
          200: "#ffe0a4",
          300: "#ffc96b",
          400: "#ffac2f",
          500: "#f98f07",
          600: "#dd6d02",
          700: "#b74d06",
          800: "#943b0c",
          900: "#7a320d",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -15px rgba(20, 54, 35, 0.25)",
      },
    },
  },
  plugins: [],
};
