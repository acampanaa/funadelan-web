import { defineConfig, envField } from 'astro/config';
import sanity from '@sanity/astro';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// El projectId es público (no es un secreto). Se deja directo para evitar
// que la config no lo lea desde .env; se puede sobrescribir por entorno.
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'r3bjzif4';
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
