// Publica en Sanity la información del CAIMHA que se muestra en
// /programas/actividades-sociales, con la foto de la inauguración.
//   npx sanity exec scripts/subir-caimha.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream, existsSync } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const IMAGEN = 'inauguracion.jpg';

const parrafos = [
  'El Centro de Atención Integral Manabí Humano «Ángeluz» abre sus puertas para ti.',
  'Brindamos atención gratuita en terapia física, ocupacional, de lenguaje, psicología y odontología.',
  '📍 ¡Te esperamos de lunes a viernes para cuidar de ti y tu familia!',
];

const bloques = parrafos.map((texto, i) => ({
  _type: 'block',
  _key: `b${i}`,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `s${i}`, text: texto, marks: [] }],
}));

(async () => {
  if (!existsSync(IMAGEN)) throw new Error(`No existe ${IMAGEN} en la raíz del proyecto`);

  const asset = await client.assets.upload('image', createReadStream(IMAGEN), {
    filename: 'caimha.jpg',
  });
  console.log('  · imagen subida');

  await client.createOrReplace({
    _id: 'proyecto-caimha',
    _type: 'proyecto',
    nombre: 'Centro de Atención Integral Manabí Humano «Ángeluz»',
    slug: { _type: 'slug', current: 'caimha' },
    categoria: 'actividades',
    resumen:
      'Atención gratuita en terapia física, ocupacional y de lenguaje, psicología y odontología, de lunes a viernes, en nuestra sede de El Limón.',
    imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    descripcion: bloques,
    destacado: true,
    orden: 1,
  });

  console.log('OK CAIMHA publicado: /programas/actividades-sociales');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
