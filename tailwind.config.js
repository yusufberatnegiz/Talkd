/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
      colors: {
        background: '#16162a',
        foreground: '#eeeef5',
        surface: '#1e1e36',
        elevated: '#252542',
        card: '#1e1e36',
        'card-foreground': '#eeeef5',
        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        'primary-soft': '#21213e',
        secondary: '#2d2d4a',
        'secondary-foreground': '#c8c8d8',
        muted: '#2d2d4a',
        'muted-foreground': '#9090aa',
        accent: '#4f4f7a',
        'accent-foreground': '#eeeef5',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        success: '#10b981',
        border: '#2e2e4a',
        input: '#2d2d4a',
        ring: '#6366f1',
      },
    },
  },
};
