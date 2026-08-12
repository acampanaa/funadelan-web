import { defineField, defineType } from 'sanity';

// Fotos del carrusel de portada (sección Hero de Inicio). Con una sola
// imagen se ve estática; con varias, rotan automáticamente.
export const heroImagen = defineType({
  name: 'heroImagen',
  title: 'Imagen del Hero (portada)',
  type: 'document',
  fields: [
    defineField({
      name: 'imagen',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description: 'Describe la foto para lectores de pantalla (qué se ve, quiénes aparecen).',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'orden', title: 'Orden', type: 'number' }),
  ],
  orderings: [{ title: 'Orden', name: 'ordenAsc', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'alt', media: 'imagen' } },
});
