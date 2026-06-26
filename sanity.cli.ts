import { defineCliConfig } from 'sanity/cli';

// Configuración de la CLI de Sanity (necesaria para `sanity dev` / `sanity deploy`).
// El projectId es público (no es un secreto); igual se puede sobrescribir por entorno.
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'r3bjzif4',
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
});