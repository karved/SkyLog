/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#38BDF8', // Sky Blue
        secondary: '#6366F1', // Indigo
        accent: '#FB7185', // Coral
        background: '#F9FAFB', // Light Gray
      }
    },
  },
  plugins: [],
}
