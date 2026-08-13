// Sube los logos preparados y crea/actualiza las alianzas en Sanity.
// Ejecutar: npx sanity exec scripts/subir-alianzas.cjs --with-user-token
const fs = require('node:fs');
const path = require('node:path');
const { getCliClient } = require('sanity/cli');
const client = getCliClient({ apiVersion: '2024-12-01' });
const root = path.resolve(__dirname, '..', 'alianzas');
const assetsSubidos = new Map();
const alianzas = [
  ['guiferza', 'Guiferza', 'guiferza.jpeg'],
  ['stefanos-eventos-catering', 'Stefano’s Eventos & Catering', 'stefanos.jpg'],
  ['alcaldia-pincay', 'Alcaldía de Pincay', 'alcaldia-pincay.jpg'],
  ['prefectura-manabi', 'Prefectura de Manabí', 'prefectura-manabi.png'],
  ['carlos-mendoza-alcalde', 'Carlos Mendoza — Alcalde', 'carlos-mendoza-alcalde-sucre.jpg'],
  ['comisariato-gonzalo-zambrano', 'Comisariato Gonzalo Zambrano', 'gonzalo-zambrano.png'],
  ['rolando-ponce', 'Ing. Rolando Ponce y Sra.', 'rolando-ponce.jpeg'],
  ['cltd-business-legal-advisors', 'CLTD Business Legal Advisors', 'cltd.jpeg'],
  ['ceibo-real-hotel', 'Ceibo Real Hotel', 'hotel-ceibo-real.png'],
  ['carl-plas-desechables', 'Desechables Carl Plas', 'carl-plast.jpg'],
  ['gladis-salamanca-forero', 'Sra. Gladis Salamanca de Forero', 'sra-gladis.jpeg'],
  ['el-diario', 'El Diario', 'el-diario.jpg'],
  ['guiferza-2', 'Guiferza (segunda imagen)', 'guiferza.jpeg'],
  ['rutas-portovejenses', 'Rutas Portovejenses', 'rutas-portovejenses.jpg'],
  ['ceibo-dorado-hotel', 'Ceibo Dorado Hotel', 'ceibo-dorado-hotel.jpg'],
  ['viutoria', 'Viutoria', 'viutoria.jpeg'],
  ['anihol', 'AVIHOL — Importación de productos avícolas', 'avihol.jpg'],
  ['servicopia', 'Servicopia', 'servicopia.jpg'],
];
async function subirLogo(nombreArchivo) {
  if (assetsSubidos.has(nombreArchivo)) return assetsSubidos.get(nombreArchivo);
  const archivo = path.join(root, nombreArchivo);
  if (!fs.existsSync(archivo)) throw new Error(`No existe ${archivo}`);
  const asset = await client.assets.upload('image', fs.createReadStream(archivo), { filename: nombreArchivo });
  assetsSubidos.set(nombreArchivo, asset);
  return asset;
}
(async () => {
  for (let i = 0; i < alianzas.length; i += 1) {
    const [slug, nombre, nombreArchivo] = alianzas[i];
    const asset = await subirLogo(nombreArchivo);
    await client
      .patch(`alianza-${slug}`)
      .set({ nombre, logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }, orden: i + 1 })
      .commit();
    console.log(`OK: ${nombre}`);
  }
})().catch((error) => { console.error('ERROR:', error.message); process.exit(1); });
