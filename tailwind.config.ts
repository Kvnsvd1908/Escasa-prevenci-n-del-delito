import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222 26% 6%)",
        foreground: "hsl(210 24% 96%)",
        card: "hsl(222 22% 10%)",
        "card-foreground": "hsl(210 24% 96%)",
        border: "hsl(218 20% 21%)",
        input: "hsl(220 18% 14%)",
        primary: "hsl(204 94% 58%)",
        "primary-foreground": "hsl(220 10% 98%)",
        secondary: "hsl(219 18% 16%)",
        "secondary-foreground": "hsl(210 24% 92%)",
        muted: "hsl(220 18% 15%)",
        "muted-foreground": "hsl(214 12% 66%)",
        accent: "hsl(215 25% 18%)",
        "accent-foreground": "hsl(220 10% 98%)",
        destructive: "hsl(0 78% 58%)",
        "destructive-foreground": "hsl(0 0% 98%)",
        success: "hsl(151 72% 44%)",
        warning: "hsl(42 95% 56%)",
        danger: "hsl(0 78% 58%)",
        evidence: "hsl(39 95% 57%)",
        steel: "hsl(214 15% 34%)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
