/** @type {import(''tailwindcss'').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffdf7',
          100: '#fff8ec',
          200: '#fbe9c9',
        },
        saffron: {
          100: '#fde7ab',
          200: '#f7d47d',
          300: '#f3c54d',
          400: '#efb120',
          500: '#dd970b',
          600: '#c77f08',
        },
        charcoal: {
          700: '#334155',
          800: '#1f2937',
          900: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(146, 96, 10, 0.14)',
        card: '0 18px 50px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(241, 184, 11, 0.18), rgba(255, 253, 247, 0))',
      },
    },
  },
  plugins: [],
};