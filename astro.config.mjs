import { defineConfig } from 'astro/config';

// import tailwind from '@astrojs/tailwind';
import tailwindcss from "@tailwindcss/vite";
import icon from 'astro-icon';
import { fileURLToPath } from "url";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'static',
  site: "https://kthrob.github.io",
  integrations: [icon(), mdx(), sitemap()],
  vite: {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [ tailwindcss() ],
  },
});