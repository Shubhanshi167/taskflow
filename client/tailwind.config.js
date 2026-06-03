/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body:    ["Plus Jakarta Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
          300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
          600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
        },
        surface: {
          primary:   "#070b14",
          secondary: "#0d1424",
          card:      "#111827",
          elevated:  "#1a2540",
          input:     "#0f1929",
        },
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #3b82f6, #2563eb)",
        "gradient-aurora": "linear-gradient(135deg, #3b82f6, #06b6d4)",
        "gradient-violet": "linear-gradient(135deg, #8b5cf6, #3b82f6)",
      },
      boxShadow: {
        brand: "0 8px 32px rgba(59,130,246,0.35)",
        glow:  "0 0 80px rgba(59,130,246,0.15)",
        card:  "0 4px 20px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease-out both",
        "fade-in":    "fadeIn 0.4s ease-out both",
        "scale-in":   "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "float":      "float 3.5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "shimmer":    "shimmer 1.6s infinite",
        "spin-slow":  "spin 8s linear infinite",
        "ping-slow":  "ping 2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        fadeUp:    { from:{opacity:"0",transform:"translateY(20px)"}, to:{opacity:"1",transform:"translateY(0)"} },
        fadeIn:    { from:{opacity:"0"}, to:{opacity:"1"} },
        scaleIn:   { from:{opacity:"0",transform:"scale(0.96)"}, to:{opacity:"1",transform:"scale(1)"} },
        float:     { "0%,100%":{transform:"translateY(0)"}, "50%":{transform:"translateY(-10px)"} },
        pulseGlow: { "0%,100%":{boxShadow:"0 0 20px rgba(59,130,246,0.3)"}, "50%":{boxShadow:"0 0 50px rgba(59,130,246,0.7)"} },
        shimmer:   { "0%":{backgroundPosition:"-200% 0"}, "100%":{backgroundPosition:"200% 0"} },
      },
    },
  },
  plugins: [],
};