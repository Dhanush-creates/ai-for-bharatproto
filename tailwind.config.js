/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#4d88ff",
        "primary-dark": "#3a6bc7",
        "background-light": "#f5f6f8",
        "background-dark": "#0f1623",
        "surface-dark": "#1a2333", // dashboard
        "surface-auth-dark": "#1a2436", // auth
        "surface-lighter": "#242f42",
        "border-dark": "#2e426b",
        "surface-border": "#2b3b55", // auth
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "sm": "0.5rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, rgba(77, 136, 255, 0.15) 0%, rgba(15, 22, 35, 0) 50%, rgba(124, 58, 237, 0.15) 100%)',
        'btn-gradient': 'linear-gradient(90deg, #4d88ff 0%, #3b82f6 100%)',
      }
    },
  },
  plugins: [],
}
