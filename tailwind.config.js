/** @type {import('tailwindcss').Config} */
export default {
  content: ['.vitepress/theme/**/*.vue', './packages/vue/.vitepress/theme/*.js'],

  theme: {
    extend: {
      colors: {
        'ns': '#65adf1',
        "primary": "#0f172a",
        "secondary": "#18233f",
        "table-divider": "#202e52"
      },
    },
  },
  plugins: [],
}

