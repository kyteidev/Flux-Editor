/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#111827",

          "primary-content": "#f3f4f6",

          secondary: "#1f2937",

          accent: "#1e3a8a",

          neutral: "#6b7280",

          "base-100": "#374151",

          "base-200": "#262e3a",

          info: "#1e40af",

          success: "#16a34a",

          warning: "#ca8a04",

          error: "#b91c1c",
        },
      },
    ],
  },
}