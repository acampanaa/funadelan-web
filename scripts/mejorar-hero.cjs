// Reemplaza las imágenes del carrusel Hero por versiones ampliadas y enfocadas.
// Ejecutar: npx sanity exec scripts/mejorar-hero.cjs --with-user-token
const fs = require('node:fs');
const path = require('node:path');
const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-12-01' });
const root = path.resolve(__dirname, '..', 'tmp', 'hero-upscaled');
const heroes = [
  ['wYq97Va4EJb4TNTBO2cHuk', 'hero-actividad-comunitaria', 'Personas mayores, familias y voluntarios durante una actividad comunitaria de FUNADELÁN', 1],
  ['wYq97Va4EJb4TNTBO2cha9', 'hero-encuentro-adultos-mayores', 'Grupo de adultos mayores y voluntarios de FUNADELÁN reunidos en un encuentro de la fundación', 2],
  ['wYq97Va4EJb4TNTBO2ciCl', 'hero-centro-angeluz', 'Adultos mayores participando en una actividad del Centro Diurno Ángeluz de FUNADELÁN', 3],
  ['wYq97Va4EJb4TNTBO2cih6', 'hero-celebracion-funadelan', 'Gran grupo de adultos mayores, familias y voluntarios en una celebración de FUNADELÁN', 4],
];

(async () => {
  for (const [id, slug, alt, orden] of heroes) {
    const filename = `${slug}.jpg`;
    const file = path.join(root, filename);
    const asset = await client.assets.upload('image', fs.createReadStream(file), { filename });
    await client.createOrReplace({
      _id: id,
      _type: 'heroImagen',
      alt,
      orden,
      imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    });
    console.log(`OK: ${filename}`);
  }
})().catch((error) => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
