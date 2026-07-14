/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d6ff',
          300: '#94b8ff',
          400: '#4785ff',
          500: '#0052ff', // Coinbase Blue
          600: '#0052ff', // Coinbase Blue
          700: '#003ecc', // Coinbase Deeper Blue Active
          800: '#003ecc',
          900: '#002aa3',
        },
        green: {
          50: '#e6f7ef',
          100: '#ccefdc',
          500: '#05b169', // Semantic Up
          600: '#05b169',
          700: '#048e54',
        },
        red: {
          50: '#fbe8ea',
          100: '#f7d2d5',
          500: '#cf202f', // Semantic Down
          600: '#cf202f',
          700: '#a61a26',
        },
        gray: {
          50: '#f7f7f7',  // Surface Soft
          100: '#f7f7f7',
          200: '#dee1e6', // Hairline
          300: '#dee1e6',
          400: '#a8acb3', // Muted Soft
          500: '#7c828a', // Muted
          600: '#5b616e', // Body Text
          700: '#5b616e',
          850: '#16181c', // Surface Dark Elevated
          900: '#0a0b0d', // Ink
          950: '#0a0b0d', // Surface Dark
        },
        slate: {
          900: '#0a0b0d', // Surface Dark
          950: '#0a0b0d',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
