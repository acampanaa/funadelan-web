// Publica el organigrama real (solo cargos, sin nombres de personas —
// decisión explícita del proyecto) y borra los cargos de prueba que había.
//   npx sanity exec scripts/subir-organigrama.cjs --with-user-token
const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-12-01' });

const CARGOS_DE_PRUEBA = [
  '3d6e1fd6-a6c3-4cf3-aca7-a3954df9d793',
  '7b03dacb-998e-401a-af7c-562d2afba2c2',
];

(async () => {
  for (const id of CARGOS_DE_PRUEBA) {
    await client.delete(id).catch(() => {});
  }
  console.log('Cargos de prueba eliminados.');

  const presidente = await client.createOrReplace({
    _id: 'cargo-presidente',
    _type: 'miembroOrganigrama',
    cargo: 'Presidente',
    area: 'Directiva',
    nivel: 1,
    orden: 1,
  });
  console.log('OK: Presidente');

  const puestos = [
    { id: 'cargo-vicepresidente', cargo: 'Vicepresidente', orden: 1 },
    { id: 'cargo-tesorera', cargo: 'Tesorera', orden: 2 },
    { id: 'cargo-secretaria', cargo: 'Secretaria', orden: 3 },
  ];

  for (const p of puestos) {
    await client.createOrReplace({
      _id: p.id,
      _type: 'miembroOrganigrama',
      cargo: p.cargo,
      area: 'Directiva',
      nivel: 2,
      orden: p.orden,
      reportaA: { _type: 'reference', _ref: presidente._id },
    });
    console.log(`OK: ${p.cargo}`);
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
