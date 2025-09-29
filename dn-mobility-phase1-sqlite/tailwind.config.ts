import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { primary:'#1756FF', gray900:'#111827', gray700:'#374151', gray400:'#9CA3AF', gray100:'#F3F4F6' },
      borderRadius: { '2xl': '1rem' }
    }
  },
  plugins: []
}
export default config
