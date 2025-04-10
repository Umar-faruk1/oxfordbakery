import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss/plugin")((({ addVariant }: { addVariant: (name: string, pattern: string) => void }) => {
      addVariant("group-data-[state=expanded]", ":merge(.group)[data-state=expanded] &")
      addVariant("group-data-[state=collapsed]", ":merge(.group)[data-state=collapsed] &")
      addVariant("group-data-[collapsible=offcanvas]", ":merge(.group)[data-collapsible=offcanvas] &")
      addVariant("group-data-[collapsible=icon]", ":merge(.group)[data-collapsible=icon] &")
      addVariant("group-data-[variant=floating]", ":merge(.group)[data-variant=floating] &")
      addVariant("group-data-[variant=inset]", ":merge(.group)[data-variant=inset] &")
      addVariant("group-data-[side=left]", ":merge(.group)[data-side=left] &")
      addVariant("group-data-[side=right]", ":merge(.group)[data-side=right] &")
      addVariant("peer-data-[active=true]", ":merge(.peer)[data-active=true] ~ &")
      addVariant("peer-data-[size=sm]", ":merge(.peer)[data-size=sm] ~ &")
      addVariant("peer-data-[size=default]", ":merge(.peer)[data-size=default] ~ &")
      addVariant("peer-data-[size=lg]", ":merge(.peer)[data-size=lg] ~ &")
    })),
  ],
} satisfies Config

export default config
