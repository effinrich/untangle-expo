/** @type {import('tailwindcss').Config} */
const tokens = require("./theme/colors")

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...tokens,
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      // iOS HIG default (Large) sizes; RN scales them with Dynamic Type / Android font scale.
      fontSize: {
        footnote: ["13px", "18px"],
        subhead: ["15px", "20px"],
        callout: ["16px", "22px"],
        body: ["17px", "24px"],
        title3: ["20px", "26px"],
        title2: ["22px", "28px"],
        title1: ["28px", "34px"],
        display: ["72px", "80px"],
      },
      minHeight: {
        touch: "44px",
        control: "48px",
        cta: "56px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
}
