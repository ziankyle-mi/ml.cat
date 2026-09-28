/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0d0f',
        'ink-raised': '#111417',
        line: '#22272c',
        paper: '#e8e4da',
        mist: '#8b9096',
        tier: {
          ss: '#c9a35b',
          s: '#a8574f',
          a: '#7d8f6a',
          b: '#6b8199',
          c: '#7a7570',
          d: '#8c6239',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        panel: '12px',
      },
    },
  },
  plugins: [],
}
