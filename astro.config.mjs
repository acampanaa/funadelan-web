import { defineConfig, envField } from 'astro/config';
import sanity from '@sanity/astro';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// Las variables de Sanity se leen desde el entorno (.env).
// Reemplaza los valores en .env — ver .env.example.
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://funadelan.org',
  adapter: netlify(),
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: '2024-12-01',
      // useCdn: true en producción para lecturas cacheadas y más rápidas.
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
