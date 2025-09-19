/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4F46E5', // A medium indigo blue
        'secondary-blue': '#6366F1', // A lighter indigo
        'bg-light': '#F9FAFB', // Very light gray background
        'text-dark': '#1F2937', // Dark gray text
        'border-light': '#D1D5DB', // Light gray border
      },
    },
  },
  plugins: [],
}