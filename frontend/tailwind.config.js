/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FFC107",        // Yellow — badges, active nav, highlights ONLY
        action: "#FF8A00",       // Orange — primary CTAs ONLY, one per screen
        ink: "#111111",          // Primary text, headings
        muted: "#666666",        // Secondary text, subheadings
        surface: "#FFFFFF",      // Card backgrounds, modals
        surfaceAlt: "#F7F7F7",   // App background, muted tiles
        border: "#E5E5E5",       // Card and input borders
        success: "#22A447",      // Low risk, verified status
        danger: "#E53935",       // Severe/High risk, critical alerts
      },
    },
  },
  plugins: [],
};
