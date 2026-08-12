// Sube los logos preparados y crea/actualiza las alianzas en Sanity.
// Ejecutar: npx sanity exec scripts/subir-alianzas.cjs --with-user-token
const fs = require('node:fs');
const path = require('node:path');
const { getCliClient } = require('sanity/cli');
const client = getCliClient({ apiVersion: '2024-12-01' });
const root = path.resolve(__dirname, '..', 'alianzas');
const alianzas = [
  ['guiferza', 'Guiferza'],
  ['stefanos-eventos-catering', 'Stefano’s Eventos & Catering'],
  ['alcaldia-pincay', 'Alcaldía de Pincay'],
  ['prefectura-manabi', 'Prefectura de Manabí'],
  ['carlos-mendoza-alcalde', 'Carlos Mendoza — Alcalde'],
  ['comisariato-gonzalo-zambrano', 'Comisariato Gonzalo Zambrano'],
  ['rolando-ponce', 'Ing. Rolando Ponce y Sra.'],
  ['cltd-business-legal-advisors', 'CLTD Business Legal Advisors'],
  ['ceibo-real-hotel', 'Ceibo Real Hotel'],
  ['carl-plas-desechables', 'Desechables Carl Plas'],
  ['gladis-salamanca-forero', 'Sra. Gladis Salamanca de Forero'],
  ['el-diario', 'El Diario'],
  ['guiferza-2', 'Guiferza (segunda imagen)'],
  ['rutas-portovejenses', 'Rutas Portovejenses'],
  ['ceibo-dorado-hotel', 'Ceibo Dorado Hotel'],
  ['viutoria', 'Viutoria'],
  ['anihol', 'ANIHOL — Importación de productos avícolas'],
  ['servicopia', 'Servicopia'],
];
async function subirLogo(slug) {
  const archivo = path.join(root, `${slug}.png`);
  if (!fs.existsSync(archivo)) throw new Error(`No existe ${archivo}`);
  return client.assets.upload('image', fs.createReadStream(archivo), { filename: `${slug}.png` });
}
(async () => {
  for (let i = 0; i < alianzas.length; i += 1) {
    const [slug, nombre] = alianzas[i];
    const asset = await subirLogo(slug);
    await client.createOrReplace({ _id: `alianza-${slug}`, _type: 'alianza', nombre, logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }, orden: i + 1 });
    console.log(`OK: ${nombre}`);
  }
})().catch((error) => { console.error('ERROR:', error.message); process.exit(1); });
