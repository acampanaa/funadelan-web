import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

// Configuración del Sanity Studio (panel administrativo).
// Ejecutar con: npx sanity dev   (requiere las deps de studio instaladas)
export default defineConfig({
  name: 'funadelan',
  title: 'FUNADELÁN — Panel de contenido',
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
