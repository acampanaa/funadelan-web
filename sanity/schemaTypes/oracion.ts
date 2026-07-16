import { defineField, defineType } from 'sanity';

export const oracion = defineType({
  name: 'oracion',
  title: 'Oración',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'imagen',
      title: 'Imagen (opcional)',
      type: 'image',
      options: { hotspot: true },
      description: 'Tarjeta o ilustración de la oración/mensaje.',
    }),
    defineField({
      name: 'texto',
      title: 'Texto de la oración',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Opcional si la imagen ya contiene el mensaje (recomendado igual para accesibilidad).',
    }),
    defineField({ name: 'fuente', title: 'Fuente / atribución', type: 'string', description: 'Opcional. Ej.: «Tradición católica».' }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: 'Menor = aparece primero.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Orden', name: 'ordenAsc', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'fuente', media: 'imagen' } },
});
