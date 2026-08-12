// Agrega a Aura Fernández como Fundadora en el organigrama.
//   npx sanity exec scripts/agregar-fundadora.cjs --with-user-token
const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-12-01' });

(async () => {
  await client.createOrReplace({
    _id: 'cargo-fundadora',
    _type: 'miembroOrganigrama',
    cargo: 'Fundadora',
    nombre: 'Aura Fernández',
    nivel: 1,
    orden: 2,
  });
  console.log('OK: Aura Fernández — Fundadora');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
