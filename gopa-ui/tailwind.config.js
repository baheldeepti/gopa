/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: { 50: '#fff8e1', 100: '#ffecb3', 200: '#ffe082', 300: '#ffd54f', 400: '#ffca28', 500: '#ffc107', 600: '#ffb300', 700: '#ffa000', 800: '#ff8f00', 900: '#ff6f00' },
        krishna: { 50: '#e3f2fd', 100: '#bbdefb', 200: '#90caf9', 300: '#64b5f6', 400: '#42a5f5', 500: '#5b8fc9', 600: '#1e88e5', 700: '#1565c0', 800: '#0d47a1', 900: '#0a2f6b' },
        vrindavan: { 50: '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7', 300: '#81c784', 400: '#66bb6a', 500: '#4caf50', 600: '#43a047', 700: '#388e3c', 800: '#2e7d32', 900: '#1b5e20' },
        warmAmber: { 50: '#fff3e0', 100: '#ffe0b2', 200: '#ffcc80', 300: '#ffb74d', 400: '#ffa726', 500: '#ff9800' },
      },
      fontFamily: {
        display: ['Fredoka', 'Comic Neue', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255,193,7,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(255,193,7,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
