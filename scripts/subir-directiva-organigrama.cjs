// Sube a Sanity el nombre y la foto de cada cargo de la directiva, que hasta
// ahora vivían hardcodeados en organigrama.astro (DIRECTIVA_LOCAL) y en
// public/img/directiva/. Después de correr esto, ese objeto local ya no
// hace falta.
//   npx sanity exec scripts/subir-directiva-organigrama.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');

const client = getCliClient({ apiVersion: '2024-12-01' });

const CARPETA = 'public/img/directiva';

const DIRECTIVA = [
  { id: 'cargo-presidente', nombre: 'Pedro Fabricio Alaña Echanique, S.J.', foto: 'presidente.jpg' },
  { id: 'cargo-vicepresidente', nombre: 'Rosario Pico Macías', foto: 'vicepresidenta.jpg' },
  { id: 'cargo-tesorera', nombre: 'Norma Fernández Zambrano', foto: 'tesorera.jpg' },
  { id: 'cargo-secretaria', nombre: 'Aura Galarza Ibarra', foto: 'secretaria.jpg' },
];

(async () => {
  for (const persona of DIRECTIVA) {
    const ruta = join(CARPETA, persona.foto);
    const asset = await client.assets.upload('image', createReadStream(ruta), {
      filename: persona.foto,
    });

    await client
      .patch(persona.id)
      .set({
        nombre: persona.nombre,
        foto: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      })
      .commit();

    console.log(`OK: ${persona.nombre} (${persona.id})`);
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
