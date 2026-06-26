import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

// Configuración del Sanity Studio (panel administrativo).
// Ejecutar con: npx sanity dev   (requiere las deps de studio instaladas)
export default defineConfig({
  name: 'funadelan',
  title: 'FUNADELÁN — Panel de contenido',
  // El projectId es público (no es un secreto). La CLI de Sanity no inyecta
  // variables PUBLIC_*, por eso va directo aquí.
  projectId: 'r3bjzif4',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
