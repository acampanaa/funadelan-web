// Sube la foto que hoy usa el hero de Inicio como primera imagen del
// carrusel (tipo "heroImagen") en Sanity.
//   npx sanity exec scripts/subir-hero-imagenes.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const RUTA = 'C:/Users/acamp/funadelan-web/public/img/derechos-adulto-mayor/derecho-01-principal.jpg';
const ALT = 'Personas mayores, familias y voluntarios durante una actividad comunitaria de FUNADELÁN';

(async () => {
  const asset = await client.assets.upload('image', createReadStream(RUTA), {
    filename: 'hero-01.jpg',
  });

  await client.create({
    _type: 'heroImagen',
    imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    alt: ALT,
    orden: 1,
  });

  console.log('OK: imagen del hero subida a Sanity.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
