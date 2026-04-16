import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from "@sanity/astro";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sanity({
      projectId: "58vcqj2e",
      dataset: "finsoc",
      useCdn: false, // Set to true for production if needed
      studioBasePath: "/admin",
    }),
  ],
});
