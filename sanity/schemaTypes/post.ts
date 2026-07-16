import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Publicación',
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
    defineField({ name: 'fecha', title: 'Fecha', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'autor', title: 'Autor', type: 'string' }),
    defineField({
      name: 'resumen',
      title: 'Resumen',
      type: 'text',
      rows: 3,
      description: 'Texto corto para tarjetas y la página principal.',
      validation: (r) => r.max(300),
    }),
    defineField({
      name: 'contenido',
      title: 'Contenido',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'imagenes',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
      description: 'Una o varias fotos de la publicación.',
    }),
    defineField({ name: 'destacado', title: 'Destacado en Inicio', type: 'boolean', initialValue: true }),
  ],
  orderings: [{ title: 'Más recientes', name: 'fechaDesc', by: [{ field: 'fecha', direction: 'desc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'fecha', media: 'imagenes.0' } },
});
