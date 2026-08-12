// Sube el informe de rendición de cuentas 2025 (PPT Asamblea 14-04-2025, convertido a PDF).
//   npx sanity exec scripts/subir-informe-2025.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const RUTA = 'C:/Users/acamp/funadelan-web/scripts/rendicion-cuentas-2025.pdf';

(async () => {
  const asset = await client.assets.upload('file', createReadStream(RUTA), {
    filename: 'rendicion-de-cuentas-2025.pdf',
  });

  await client.create({
    _type: 'informe',
    titulo: 'Asamblea general 2025',
    anio: 2025,
    descripcion: 'Presentación de la asamblea general del 14 de abril de 2025.',
    archivo: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
  });

  console.log('OK: informe 2025 subido.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
