/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: '#FAF7EE',
          surface: '#FFFFFF',
          dark: '#121212',
          yellow: '#FFE600',
          pink: '#FF6EA7',
          purple: '#A388EE',
          green: '#00E599',
          blue: '#38BDF8',
          orange: '#FF914D',
          red: '#FF4D4D',
          muted: '#E5DFD3',
        },
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #121212',
        'brutal': '4px 4px 0px 0px #121212',
        'brutal-lg': '6px 6px 0px 0px #121212',
        'brutal-xl': '8px 8px 0px 0px #121212',
        'brutal-yellow': '4px 4px 0px 0px #FFE600',
        'brutal-pink': '4px 4px 0px 0px #FF6EA7',
        'brutal-green': '4px 4px 0px 0px #00E599',
        'brutal-purple': '4px 4px 0px 0px #A388EE',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        display: ['Outfit', 'Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
