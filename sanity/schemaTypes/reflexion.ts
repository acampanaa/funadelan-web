import { defineField, defineType } from 'sanity';

export const reflexion = defineType({
  name: 'reflexion',
  title: 'Reflexión / Mensaje',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug (URL)', type: 'slug', options: { source: 'titulo' } }),
    defineField({ name: 'fecha', title: 'Fecha', type: 'datetime' }),
    defineField({ name: 'autor', title: 'Autor', type: 'string' }),
    defineField({ name: 'cuerpo', title: 'Contenido', type: 'array', of: [{ type: 'block' }, { type: 'image' }], validation: (r) => r.required() }),
  ],
  orderings: [{ title: 'Más recientes', name: 'fechaDesc', by: [{ field: 'fecha', direction: 'desc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'autor' } },
});
