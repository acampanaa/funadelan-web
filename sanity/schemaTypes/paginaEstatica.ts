import { defineField, defineType } from 'sanity';

// Contenido editable de páginas informativas (La fundación, Historia,
// Misión/Visión, etc.) — permite al administrador editar textos e imágenes
// sin tocar código. Se identifica por "clave".
export const paginaEstatica = defineType({
  name: 'paginaEstatica',
  title: 'Página estática',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'clave',
      title: 'Clave de página',
      type: 'string',
      description: 'Identificador único usado por el sitio (ej. "historia", "mision-vision").',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'lead', title: 'Texto introductorio', type: 'text', rows: 2 }),
    defineField({ name: 'imagen', title: 'Imagen de cabecera', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'cuerpo', title: 'Contenido', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'clave' } },
});
