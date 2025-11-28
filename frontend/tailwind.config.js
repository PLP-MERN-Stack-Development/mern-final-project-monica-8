/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: This path ensures Tailwind scans all your React files for classes.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}