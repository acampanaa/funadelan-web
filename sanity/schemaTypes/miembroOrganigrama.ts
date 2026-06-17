import { defineField, defineType } from 'sanity';

// Organigrama SIN nombres de miembros (según decisión del sitemap):
// se modelan los cargos y su jerarquía, no las personas.
export const miembroOrganigrama = defineType({
  name: 'miembroOrganigrama',
  title: 'Cargo (Organigrama)',
  type: 'document',
  fields: [
    defineField({ name: 'cargo', title: 'Cargo', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'area', title: 'Área / Departamento', type: 'string' }),
    defineField({ name: 'nivel', title: 'Nivel jerárquico', type: 'number', description: '1 = más alto.', validation: (r) => r.required() }),
    defineField({ name: 'reportaA', title: 'Reporta a', type: 'reference', to: [{ type: 'miembroOrganigrama' }] }),
    defineField({ name: 'orden', title: 'Orden en su nivel', type: 'number' }),
  ],
  preview: { select: { title: 'cargo', subtitle: 'area' } },
});
