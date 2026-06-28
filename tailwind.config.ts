import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Noto Serif JP', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
