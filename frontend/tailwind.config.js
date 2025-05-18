/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1DA1F2",
        secondary: "#657786",
        dark: "#14171A",
        light: "#AAB8C2",
        extralight: "#E1E8ED",
        background: "#F5F8FA",
      },
    },
  },
  plugins: [],
} 