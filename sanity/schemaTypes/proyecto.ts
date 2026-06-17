import { defineField, defineType } from 'sanity';

export const proyecto = defineType({
  name: 'proyecto',
  title: 'Proyecto / Programa',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (URL)', type: 'slug', options: { source: 'nombre' }, validation: (r) => r.required() }),
    defineField({
      name: 'categoria',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Universidad del Adulto Mayor', value: 'uam' },
          { title: 'Red Mundial del Adulto Mayor', value: 'red-mundial' },
          { title: 'Actividades sociales', value: 'actividades' },
          { title: 'Centro Diurno "Ángeluz"', value: 'angeluz' },
        ],
      },
    }),
    defineField({ name: 'resumen', title: 'Resumen', type: 'text', rows: 3 }),
    defineField({ name: 'imagen', title: 'Imagen', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
    defineField({ name: 'destacado', title: 'Destacado', type: 'boolean', initialValue: false }),
    defineField({ name: 'orden', title: 'Orden', type: 'number' }),
  ],
  preview: { select: { title: 'nombre', subtitle: 'categoria', media: 'imagen' } },
});
