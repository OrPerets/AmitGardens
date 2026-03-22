import type { Config } from "tailwindcss";
import { tokens } from "./lib/tokens";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1rem",
          md: "2rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        sm: tokens.radii.sm,
        DEFAULT: tokens.radii.md,
        md: tokens.radii.md,
        lg: tokens.radii.lg,
        xl: tokens.radii.xl,
      },
      boxShadow: {
        none: "none",
        sm: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.1)",
        DEFAULT: "0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)",
        md: "0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.1)",
        lg: "0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.1)",
        xl: "0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.1)",
        inner: "inset 0 2px 4px 0 rgba(16, 24, 40, 0.05)",
      },
      animation: {
        'fade-in': 'fade-in 300ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-up': 'slide-up 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-down': 'slide-down 250ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'scale-in': 'scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bounce-in': 'bounce-in 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'pulse-success': 'pulse-success 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
