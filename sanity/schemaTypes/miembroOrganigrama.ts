import { defineField, defineType } from 'sanity';

// El organigrama nació modelando solo los cargos y su jerarquía, sin personas.
// Esa decisión cambió: ahora la fundación quiere mostrar quién ocupa cada
// puesto, con nombre y fotografía. `nombre` y `foto` son opcionales para que un
// cargo vacante siga apareciendo con su casilla.
export const miembroOrganigrama = defineType({
  name: 'miembroOrganigrama',
  title: 'Cargo (Organigrama)',
  type: 'document',
  fields: [
    defineField({ name: 'cargo', title: 'Cargo', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'nombre',
      title: 'Nombre de la persona',
      type: 'string',
      description: 'Nombre y apellidos de quien ocupa el cargo. Déjalo vacío si está vacante.',
    }),
    defineField({
      name: 'foto',
      title: 'Fotografía',
      type: 'image',
      options: { hotspot: true },
      description: 'Retrato. Se recorta en círculo, así que conviene centrar el rostro.',
    }),
    defineField({ name: 'area', title: 'Área / Departamento', type: 'string' }),
    defineField({ name: 'nivel', title: 'Nivel jerárquico', type: 'number', description: '1 = más alto.', validation: (r) => r.required() }),
    defineField({ name: 'reportaA', title: 'Reporta a', type: 'reference', to: [{ type: 'miembroOrganigrama' }] }),
    defineField({ name: 'orden', title: 'Orden en su nivel', type: 'number' }),
  ],
  preview: { select: { title: 'cargo', subtitle: 'nombre', media: 'foto' } },
});
