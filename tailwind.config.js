/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#008170'
        },
        'secondary': {
          100: '#F8F9FE',
          200: '#F8F9FE',
          DEFAULT: '#C5C6CC'
        }
      }
    },
  },
  plugins: [],
}

