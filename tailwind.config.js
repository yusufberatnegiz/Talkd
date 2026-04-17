/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#1a1a2e',
        foreground: '#f2f2f5',
        card: '#252538',
        'card-foreground': '#f2f2f5',
        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        secondary: '#2d2d45',
        'secondary-foreground': '#c8c8d8',
        muted: '#2d2d45',
        'muted-foreground': '#9898aa',
        accent: '#4f4f7a',
        'accent-foreground': '#f2f2f5',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#3a3a55',
        input: '#2d2d45',
        ring: '#6366f1',
      },
    },
  },
};
