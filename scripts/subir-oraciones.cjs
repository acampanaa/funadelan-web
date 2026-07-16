// Sube las imágenes de la carpeta /oraciones a Sanity y publica cada mensaje
// como documento "oracion" (con imagen + texto transcrito para accesibilidad).
// Ejecutar con la sesión del usuario:
//   npx sanity exec scripts/subir-oraciones.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream } = require('node:fs');
const { basename } = require('node:path');

const client = getCliClient({ apiVersion: '2024-12-01' });

const items = [
  {
    _id: 'oracion-san-valentin',
    titulo: 'Modo San Valentín',
    fuente: 'Fundación Amigos de los Ángeles',
    orden: 2,
    archivo: 'oraciones/634004957_1335053045337460_1107447405714520427_n.jpg',
    parrafos: [
      'En este Día de San Valentín celebramos el amor que nace del servicio, la fe que se convierte en acción y la solidaridad que toca vidas.',
      'Gracias, voluntarios y auspiciantes, por ser instrumentos de amor, esperanza y luz. Que Dios multiplique en bendiciones todo lo que entregan desde el corazón.',
    ],
  },
  {
    _id: 'oracion-dia-de-la-mujer',
    titulo: 'Día Internacional de la Mujer',
    fuente: 'Directiva 2025-2027',
    orden: 3,
    archivo: 'oraciones/649407971_1353732093469555_6971164646796318261_n.jpg',
    parrafos: [
      'Hoy, en el Día Internacional de la Mujer, desde nuestra Fundación rendimos homenaje a la fortaleza, valentía y resiliencia de todas las mujeres.',
      'Reconocemos su invaluable aporte en la construcción de una sociedad más justa, solidaria y llena de esperanza.',
      'Seguimos comprometidos en promover el respeto, la igualdad de oportunidades y el empoderamiento de cada mujer.',
      'Gracias por inspirar, liderar y transformar el mundo cada día. ¡Feliz Día de la Mujer!',
    ],
  },
];

const bloques = (parrafos) =>
  parrafos.map((t, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text: t, marks: [] }],
  }));

(async () => {
  for (const it of items) {
    const asset = await client.assets.upload('image', createReadStream(it.archivo), {
      filename: basename(it.archivo),
    });
    await client.createOrReplace({
      _id: it._id,
      _type: 'oracion',
      titulo: it.titulo,
      fuente: it.fuente,
      orden: it.orden,
      texto: bloques(it.parrafos),
      imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    });
    console.log(`OK Publicada "${it.titulo}"  (asset ${asset._id})`);
  }
  console.log('Listo.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
