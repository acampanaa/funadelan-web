// Sube "hero 2.jpg", "hero 3.jpg" y "hero 5.jpg" (raíz del repo) como
// imágenes del carrusel del hero de Inicio, a continuación de la que ya
// se subió antes (orden 1).
//   npx sanity exec scripts/subir-hero-2-3-5.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const FOTOS = [
  { ruta: 'C:/Users/acamp/funadelan-web/hero 2.jpg', orden: 2, alt: 'Grupo de adultos mayores y voluntarios de FUNADELÁN reunidos en un encuentro de la fundación' },
  { ruta: 'C:/Users/acamp/funadelan-web/hero 3.jpg', orden: 3, alt: 'Adultos mayores participando en una actividad del Centro Diurno Ángeluz de FUNADELÁN' },
  { ruta: 'C:/Users/acamp/funadelan-web/hero 5.jpg', orden: 4, alt: 'Gran grupo de adultos mayores, familias y voluntarios en una celebración de FUNADELÁN' },
];

(async () => {
  for (const foto of FOTOS) {
    const asset = await client.assets.upload('image', createReadStream(foto.ruta), {
      filename: `hero-${foto.orden}.jpg`,
    });
    await client.create({
      _type: 'heroImagen',
      imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      alt: foto.alt,
      orden: foto.orden,
    });
    console.log(`OK: ${foto.ruta} subida (orden ${foto.orden}).`);
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
