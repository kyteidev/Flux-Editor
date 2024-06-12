/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/globals.css"],
  theme: {
    colors: {
      primary: "var(--primary)",

      "primary-hover": "var(--primary-hover)",

      content: "var(--content)",

      accent: "var(--accent)",

      neutral: "var(--neutral)",

      "base-100": "var(--base-100)",

      "base-100-hover": "var(--base-100-hover)",

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
