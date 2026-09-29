/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ph: {
          blue: '#003366',
          navy: '#0B2545',
          gold: '#D4AF37',
          'gold-hover': '#B8952E',
          charcoal: '#1A1D20',
          cream: '#F8F9FA',
          'card-bg': '#FFFFFF',
        },
        oes: {
          red: '#C0392B',
          blue: '#2980B9',
          yellow: '#F39C12',
          green: '#27AE60',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(11, 37, 69, 0.08)',
        'card-hover': '0 10px 30px -4px rgba(0, 51, 102, 0.15)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};
