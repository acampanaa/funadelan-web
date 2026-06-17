import { defineField, defineType } from 'sanity';

// Cubre el hueco #11: informes de rendición de cuentas descargables.
export const informe = defineType({
  name: 'informe',
  title: 'Informe (Rendición de cuentas)',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'anio', title: 'Año', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
    defineField({
      name: 'archivo',
      title: 'Archivo (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{ title: 'Año (desc)', name: 'anioDesc', by: [{ field: 'anio', direction: 'desc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'anio' } },
});
