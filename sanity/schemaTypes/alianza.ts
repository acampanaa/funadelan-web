import { defineField, defineType } from 'sanity';

export const alianza = defineType({
  name: 'alianza',
  title: 'Alianza',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre del aliado', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'sitioWeb', title: 'Sitio web', type: 'url' }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 2 }),
    defineField({ name: 'orden', title: 'Orden', type: 'number' }),
  ],
  preview: { select: { title: 'nombre', media: 'logo' } },
});
