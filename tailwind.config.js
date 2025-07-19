module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease-in-out infinite',
        'fade-in': 'fade-in 1s ease-out both',
        'bounce': 'bounce 1.5s infinite',
      },
      colors: {
        glass: 'rgba(255,255,255,0.3)',
        'glass-dark': 'rgba(24,24,27,0.7)',
      },
    },
  },
  plugins: [],
}; 