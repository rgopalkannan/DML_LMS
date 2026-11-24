import type { Config } from 'tailwindcss';

/* Every colour is a theme token defined in src/styles/tokens.css; screens use these names, never raw values. */
const token = (name: string): string => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: token('brand'), strong: token('brand-strong'), soft: token('brand-soft') },
        accent: { DEFAULT: token('accent'), soft: token('accent-soft') },
        surface: { DEFAULT: token('surface'), muted: token('surface-muted'), raised: token('surface-raised') },
        ink: { DEFAULT: token('ink'), muted: token('ink-muted'), inverse: token('ink-inverse') },
        line: token('line'),
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '0.875rem' },
      boxShadow: { card: '0 1px 2px rgb(28 25 23 / 0.06), 0 4px 16px rgb(28 25 23 / 0.06)' }
    }
  },
  plugins: []
} satisfies Config;
