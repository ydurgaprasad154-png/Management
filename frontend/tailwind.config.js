/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        secondary: "#000000",
        accent: "#F5F5F5",
        gold: {
          light: "#F9F4E8",
          DEFAULT: "#D4AF37",
          dark: "#AA8C39",
          premium: "#C5A85A"
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      }
    },
  },
  plugins: [],
}
