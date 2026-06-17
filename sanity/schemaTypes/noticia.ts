import { defineField, defineType } from 'sanity';

export const noticia = defineType({
  name: 'noticia',
  title: 'Noticia',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'titulo', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'fecha', title: 'Fecha de publicación', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'resumen', title: 'Resumen', type: 'text', rows: 3, description: 'Texto corto para tarjetas y boletín.', validation: (r) => r.required().max(300) }),
    defineField({ name: 'imagen', title: 'Imagen principal', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'cuerpo', title: 'Contenido', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'destacada', title: 'Destacada en Inicio', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Más recientes', name: 'fechaDesc', by: [{ field: 'fecha', direction: 'desc' }] }],
  preview: {
    select: { title: 'titulo', subtitle: 'fecha', media: 'imagen' },
  },
});
