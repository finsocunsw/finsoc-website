import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from "@sanity/astro";

// https://astro.build/config
export default defineConfig({
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
