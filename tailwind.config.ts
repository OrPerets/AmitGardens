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
        sm: "0 1px 2px 0 rgba(16, 24, 40, 0.06)",
        DEFAULT: "0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px 0 rgba(16, 24, 40, 0.06)",
        md: "0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.1)",
        lg: "0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};

export default config;
