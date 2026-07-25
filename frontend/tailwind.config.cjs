/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub Slate/Charcoal background palette
        dark: {
          900: '#0d1117', // Deep slate background
          800: '#161b22', // Slate card background
          700: '#21262d', // Slate border/input background
          600: '#30363d', // Dark grey hover state
        },
        // Terminal themed branding (Electric Green primary and Amber secondary)
        brand: {
          green: '#39FF14', // Electric Green
          amber: '#F2C744', // Amber accent
          dimGreen: 'rgba(57, 255, 20, 0.15)', // Neon green backdrop tint
          dimAmber: 'rgba(242, 199, 68, 0.15)', // Neon amber backdrop tint
        },
        accent: {
          green: '#2ea44f', // Clean terminal green
          cyan: '#58a6ff',  // Electric blue
          rose: '#f85149',  // Terminal red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'], // Monospace for numbers, titles, and IDs
      },
    },
  },
  plugins: [],
}
