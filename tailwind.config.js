/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        secondary: "#FF6F61",
        dark: "#121212",
        light: "#F9F9F9",
      },
    },
  },
  plugins: [],
}