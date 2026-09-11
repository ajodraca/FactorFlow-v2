/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/index.html", "./web/src/**/*.{ts,tsx}"],
  theme: {
    // Every value resolves to a `design-system/theme.css` custom property
    // (STD-UI-29). No literal length, size, or colour is introduced here.
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
        "status-good": "hsl(var(--status-good) / <alpha-value>)",
        "status-good-muted": "hsl(var(--status-good-muted) / <alpha-value>)",
        "status-warning": "hsl(var(--status-warning) / <alpha-value>)",
        "status-warning-muted": "hsl(var(--status-warning-muted) / <alpha-value>)",
        "status-critical": "hsl(var(--status-critical) / <alpha-value>)",
        "status-critical-muted": "hsl(var(--status-critical-muted) / <alpha-value>)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
      },
      height: {
        row: "var(--row-height)",
        // The status region's icons and its reserved third line take their
        // height from the spacing scale, not from Tailwind's default height
        // scale, whose values are literals rather than tokens (STD-UI-29).
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
        // Timestamps and counts render in the numeric face the design system
        // names, rather than in Tailwind's default monospace stack.
        numeric: "var(--font-numeric)",
      },
      maxWidth: {
        // The Settings screen's single narrow column (ux-design section 1.3
        // Page Layout): prose caps at this measure, tables never do.
        prose: "var(--measure-prose)",
      },
    },
  },
  plugins: [],
};
