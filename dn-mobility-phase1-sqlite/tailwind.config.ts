import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Bleu corporate (AA sur blanc)
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#b3d1ff',
          300: '#85b6ff',
          400: '#5596ff',
          500: '#2d79f6', // primaire
          600: '#1e60cf',
          700: '#174aa3',
          800: '#143e86',
          900: '#12366f',
        },
        ink: {
          900: '#0f172a', // texte
          700: '#334155',
          500: '#64748b',
          300: '#cbd5e1',
          100: '#f1f5f9',
        }
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      boxShadow: { soft: '0 6px 24px rgba(0,0,0,.06)' }
    }
  },
  plugins: [],
} satisfies Config
// styles globaux (ex: globals.css) :
// .btn = utilité simple
/* tailwind layer utilities */


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,js,jsx}','./components/**/*.{ts,tsx,js,jsx}','./pages/**/*.{ts,tsx,js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
