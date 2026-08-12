// Sube la foto de Aura Fernández (Fundadora) al organigrama en Sanity.
//   npx sanity exec scripts/subir-foto-fundadora.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const RUTA = 'C:/Users/acamp/Desktop/Aura Fernández.jpeg';

(async () => {
  const asset = await client.assets.upload('image', createReadStream(RUTA), {
    filename: 'aura-fernandez.jpeg',
  });

  await client
    .patch('cargo-fundadora')
    .set({ foto: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
    .commit();

  console.log('OK: foto de Aura Fernández subida y asignada.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
