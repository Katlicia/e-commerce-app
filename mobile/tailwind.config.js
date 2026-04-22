/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./screens/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./navigation/**/*.{js,jsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
