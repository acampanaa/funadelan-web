import { defineField, defineType } from 'sanity';

// Cubre el hueco #4 del documento: eventos destacados con fecha
// (Chocolate para el Alma, Bazar de los Ángeles, Novena de octubre).
export const evento = defineType({
  name: 'evento',
  title: 'Evento',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (URL)', type: 'slug', options: { source: 'titulo' }, validation: (r) => r.required() }),
    defineField({ name: 'fechaInicio', title: 'Fecha de inicio', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'fechaFin', title: 'Fecha de fin', type: 'datetime' }),
    defineField({ name: 'lugar', title: 'Lugar', type: 'string' }),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Evento social', value: 'social' },
          { title: 'Evento espiritual', value: 'espiritual' },
        ],
      },
    }),
    defineField({
      name: 'plantilla',
      title: 'Plantilla del boletín',
      type: 'string',
      description:
        'Diseño del correo que se envía a los suscriptores al publicar el evento. «Chocolate para el Alma» tiene el suyo propio por ser el evento anual de recaudación.',
      options: {
        list: [
          { title: 'Evento (estándar)', value: 'estandar' },
          { title: 'Chocolate para el Alma', value: 'chocolate' },
        ],
      },
      initialValue: 'estandar',
    }),
    defineField({ name: 'resumen', title: 'Resumen', type: 'text', rows: 3 }),
    defineField({
      name: 'cuerpo',
      title: 'Contenido',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      description: 'Información completa que se mostrará en la página individual del evento.',
    }),
    defineField({ name: 'imagen', title: 'Imagen', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'destacado', title: 'Destacado', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Próximos', name: 'fechaAsc', by: [{ field: 'fechaInicio', direction: 'asc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'fechaInicio', media: 'imagen' } },
});
