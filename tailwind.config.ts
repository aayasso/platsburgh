import type { Config } from "tailwindcss";

const hsl = (token: string) => `hsl(var(${token}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: hsl("--pine"),
        "pine-light": hsl("--pine-light"),
        "pine-foreground": hsl("--pine-foreground"),
        limestone: hsl("--limestone"),
        "limestone-dark": hsl("--limestone-dark"),
        ink: hsl("--ink"),
        moss: hsl("--moss"),
        brick: hsl("--brick"),
        "brick-light": hsl("--brick-light"),
        "brick-dark": hsl("--brick-dark"),
        centerline: hsl("--centerline"),
        "map-bg": hsl("--map-bg"),
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        mark: "0.12em",
        section: "0.12em",
        heading: "0.045em",
        ladder: "0.06em",
        caps: "0.14em",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
};

export default config;
