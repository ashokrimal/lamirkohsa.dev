/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Every colour resolves to a token defined in src/app/globals.css.
      // The palette values themselves live there and nowhere else.
      colors: {
        background: 'rgb(var(--paper-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-glass': 'var(--color-surface-glass)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-dark-deep': 'var(--color-surface-dark-deep)',
        'surface-sunken': 'var(--color-surface-sunken)',
        'surface-tinted': 'var(--color-surface-tinted)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--ink-secondary-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        inverse: 'rgb(var(--inverse-rgb) / <alpha-value>)',
        scrim: 'rgb(var(--scrim-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-secondary': 'rgb(var(--accent-secondary-rgb) / <alpha-value>)',
        'accent-soft': 'var(--color-accent-soft)',
        'on-dark': 'var(--color-foreground-on-dark)',
        'on-dark-muted': 'var(--color-foreground-on-dark-muted)',
        line: 'var(--color-border)',
        'line-hairline': 'var(--color-border-hairline)',
        'line-faint': 'var(--color-border-faint)',
        'line-soft': 'var(--color-border-soft)',
        'line-subtle': 'var(--color-border-subtle)',
        'line-medium': 'var(--color-border-medium)',
        'line-strong': 'var(--color-border-strong)',
        overlay: 'var(--color-overlay)',
        'overlay-faint': 'var(--color-overlay-faint)',
        'overlay-hairline': 'var(--color-overlay-hairline)',
        'overlay-soft': 'var(--color-overlay-soft)',
        'overlay-subtle': 'var(--color-overlay-subtle)',
        'overlay-medium': 'var(--color-overlay-medium)',
        'overlay-strong': 'var(--color-overlay-strong)',
        'overlay-heavy': 'var(--color-overlay-heavy)',
        // Legacy aliases — kept so older markup keeps resolving to the tokens.
        'bg-light': 'rgb(var(--paper-rgb) / <alpha-value>)',
        'text-dark': 'rgb(var(--ink-rgb) / <alpha-value>)',
        'text-light': 'rgb(var(--muted-rgb) / <alpha-value>)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
      },
    },
  },
  plugins: [],
};
