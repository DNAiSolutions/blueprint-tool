import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      /* ============================================
         ALIGN Typography - Per PRD
         Primary: Inter | Secondary: IBM Plex Mono
         ============================================ */
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'monospace'],
      },
      
      /* ============================================
         Type Scale - Per PRD specifications
         ============================================ */
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'code': ['14px', { lineHeight: '1.4', fontWeight: '700' }],
        'button': ['14px', { lineHeight: '1.5', fontWeight: '600' }],
      },
      
      /* ============================================
         Spacing - 8px Base Unit Grid (Per PRD)
         ============================================ */
      spacing: {
        'xs': '4px',
        's': '8px',
        'm': '16px',
        'l': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      
      /* ============================================
         Colors - ALIGN Design System
         ============================================ */
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          muted: "hsl(var(--sidebar-muted))",
        },
        
        /* Node Type Colors - Per PRD */
        node: {
          'lead-source': "hsl(var(--node-lead-source))",
          'intake': "hsl(var(--node-intake))",
          'decision': "hsl(var(--node-decision))",
          'conversion': "hsl(var(--node-conversion))",
          'close': "hsl(var(--node-close))",
          'fulfillment': "hsl(var(--node-fulfillment))",
          'review': "hsl(var(--node-review))",
        },

        /* Semantic aliases */
        leak: "hsl(var(--destructive))",
        positive: "hsl(var(--success))",
        neutral: "hsl(var(--muted-foreground))",
      },
      
      /* ============================================
         Border Radius - Per PRD
         ============================================ */
      borderRadius: {
        'none': '0',
        'sm': '4px',       // Micro elements
        'DEFAULT': '6px',  // Buttons, inputs
        'md': '6px',       // Buttons, inputs  
        'lg': '8px',       // Cards, nodes
        'xl': '12px',      // Large sections, modals
        '2xl': '16px',     // Extra large
        'full': '9999px',
      },
      
      /* ============================================
         Box Shadows - Per PRD Elevation Levels
         ============================================ */
      boxShadow: {
        'level-1': '0 0 20px hsl(191 100% 75% / 0.03)',
        'level-2': '0 0 30px hsl(191 100% 75% / 0.05)',
        'level-3': '0 0 40px hsl(191 100% 75% / 0.06)',
        'level-4': '0 0 60px hsl(191 100% 75% / 0.08)',
        'glow-primary': '0 0 40px hsl(191 100% 75% / 0.15)',
        'glow-leak': '0 0 8px hsl(4 78% 57% / 0.5)',
        'glow-success': '0 0 8px hsl(145 65% 42% / 0.5)',
        'ambient': '0 0 40px hsl(191 100% 75% / 0.06)',
      },
      
      /* ============================================
         Transitions - Per PRD Motion Guidelines
         ============================================ */
      transitionDuration: {
        'quick': '100ms',
        'standard': '200ms',
        'slow': '400ms',
      },
      
      /* ============================================
         Keyframes - ALIGN Animations
         ============================================ */
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "leak-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(4 78% 57% / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(4 78% 57% / 0)" },
        },
        "success-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(145 65% 42% / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px hsl(145 65% 42% / 0)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "path-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.15s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "leak-pulse": "leak-pulse 1s ease-in-out infinite",
        "success-pulse": "success-pulse 1s ease-in-out infinite",
        "count-up": "count-up 0.5s ease-out",
        "path-draw": "path-draw 0.3s ease-out forwards",
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
