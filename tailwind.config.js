/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/input.css"],
  theme: {
    colors: {
      content: "var(--content)",
      "content-main": "var(--content-main)",
      accent: "var(--accent)",
      "accent-hover": "var(--accent-hover)",

      "base-50": "var(--base-50)",
      "base-100": "var(--base-100)",
      "base-200": "var(--base-200)",
      "base-300": "var(--base-300)",

      info: "var(--info)",
      success: "var(--success)",
      warning: "var(--warning)",
      error: "var(--error)",

      transparent: "transparent",
    },
  },
  plugins: [],
};
