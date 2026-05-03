import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(220 14% 8%)",
        foreground: "hsl(220 10% 98%)",
        card: "hsl(220 14% 11%)",
        "card-foreground": "hsl(220 10% 98%)",
        border: "hsl(220 13% 20%)",
        input: "hsl(220 13% 18%)",
        primary: "hsl(217 91% 60%)",
        "primary-foreground": "hsl(220 10% 98%)",
        secondary: "hsl(220 13% 18%)",
        "secondary-foreground": "hsl(220 10% 90%)",
        muted: "hsl(220 13% 18%)",
        "muted-foreground": "hsl(220 8% 60%)",
        accent: "hsl(220 13% 18%)",
        "accent-foreground": "hsl(220 10% 98%)",
        destructive: "hsl(0 72% 51%)",
        "destructive-foreground": "hsl(0 0% 98%)",
        success: "hsl(142 70% 45%)",
        warning: "hsl(38 92% 55%)",
        danger: "hsl(0 72% 51%)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
