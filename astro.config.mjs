import { defineConfig } from 'astro/config';

import compress from "astro-compress";
import compressor from "astro-compressor";
import tailwindcss from "@tailwindcss/vite";
import icon from 'astro-icon';
import { fileURLToPath } from "url";
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import path from "path";
import promethic from "./vendor/integration";

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'static',
  site: "https://kthrob.github.io",
  integrations: [ icon({
    include: {
      'tabler': [ '*' ]
    }
  }), mdx(), sitemap(), compress({
    CSS: true,
    HTML: {
      "html-minifier-terser": {
        removeAttributeQuotes: false,
      },
    },
    Image: false,
    JavaScript: true,
    SVG: false,
    Logger: 1,
  }), compressor({
    gzip: true,
    brotli: true,
  }), promethic({
    config: "./src/config.yaml",
  }) ],
  markdown: {
    remarkPlugins: [ readingTimeRemarkPlugin ],
    rehypePlugins: [ responsiveTablesRehypePlugin, lazyImagesRehypePlugin ],
  },
  vite: {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [ tailwindcss() ],
  },
});