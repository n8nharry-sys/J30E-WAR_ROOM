import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#12224a',
        ink: '#0f1b33',
        mut: '#6b7893',
        line: '#e3e9f2',
        good: '#0f9d58',
        bad: '#e5484d',
        warn: '#f59e0b',
        blue: '#2563eb',
      },
      borderRadius: { card: '14px' },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
