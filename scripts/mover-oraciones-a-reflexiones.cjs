// Mueve los documentos de "oracion" que en realidad son mensajes/reflexiones
// (no oraciones tradicionales) al tipo "reflexion". Conserva texto, fuente
// (como autor) e imagen.
//   npx sanity exec scripts/mover-oraciones-a-reflexiones.cjs --with-user-token
const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-12-01' });

const A_MOVER = [
  { oldId: 'oracion-dia-de-la-mujer', newId: 'reflexion-dia-de-la-mujer', slug: 'dia-internacional-de-la-mujer' },
  { oldId: 'oracion-san-valentin', newId: 'reflexion-san-valentin', slug: 'modo-san-valentin' },
];

(async () => {
  for (const item of A_MOVER) {
    const doc = await client.getDocument(item.oldId);
    if (!doc) {
      console.log(`(saltado) no existe: ${item.oldId}`);
      continue;
    }

    const cuerpo = [...doc.texto];
    if (doc.imagen) {
      cuerpo.push({ _type: 'image', _key: 'img0', asset: doc.imagen.asset });
    }

    await client.createOrReplace({
      _id: item.newId,
      _type: 'reflexion',
      titulo: doc.titulo,
      slug: { _type: 'slug', current: item.slug },
      autor: doc.fuente,
      cuerpo,
    });
    console.log(`OK creada reflexión: ${doc.titulo}`);

    await client.delete(item.oldId);
    console.log(`OK eliminada oración: ${item.oldId}`);
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
