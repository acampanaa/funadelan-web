import { defineField, defineType } from 'sanity';

export const testimonio = defineType({
  name: 'testimonio',
  title: 'Testimonio',
  type: 'document',
  fields: [
    defineField({ name: 'autor', title: 'Autor', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'rol', title: 'Rol / Cargo', type: 'string', description: 'Ej. Presidente, beneficiario, aliado.' }),
    defineField({
      name: 'tipo',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Figura / presidente', value: 'figura' },
          { title: 'Logro conseguido', value: 'logro' },
        ],
      },
    }),
    defineField({ name: 'cita', title: 'Testimonio', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'foto', title: 'Foto', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'autor', subtitle: 'rol', media: 'foto' } },
});
