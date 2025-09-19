/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
          'primary-brand': '#4338CA', // Darker indigo for brand elements
          'secondary-brand': '#6366F1', // A softer indigo
          'bg-light': '#F9FAFB', // Very light gray background
          'text-dark': '#1F2937', // Dark gray text
          'text-medium': '#4B5563', // Medium gray for secondary text
          'border-light': '#E5E7EB', // Lighter border color
        },
        fontFamily: {
          'sans': ['Inter', 'sans-serif'], // Use Inter for a modern look
        },
    },
  },
  plugins: [],
}