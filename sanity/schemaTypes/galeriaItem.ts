import { defineField, defineType } from 'sanity';

export const galeriaItem = defineType({
  name: 'galeriaItem',
  title: 'Elemento de galería',
  type: 'document',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string' }),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      options: { list: [{ title: 'Foto', value: 'foto' }, { title: 'Video', value: 'video' }] },
      initialValue: 'foto',
    }),
    defineField({ name: 'imagen', title: 'Imagen', type: 'image', options: { hotspot: true }, hidden: ({ parent }) => parent?.tipo === 'video' }),
    defineField({ name: 'videoUrl', title: 'URL del video', type: 'url', hidden: ({ parent }) => parent?.tipo !== 'video' }),
    defineField({ name: 'fecha', title: 'Fecha', type: 'date' }),
  ],
  preview: { select: { title: 'titulo', media: 'imagen' } },
});
