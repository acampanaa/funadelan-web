// Sube las 4 imágenes del post y publica la "Publicación" del
// Centro de Atención Integral Manabí Humano Angeluz.
//   npx sanity exec scripts/subir-post-centro.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream, readdirSync } = require('node:fs');
const { join, basename } = require('node:path');

const client = getCliClient({ apiVersion: '2024-12-01' });

const CARPETA = 'posts/l Centro de Atención Integral Manabí Humano Angeluz';

const parrafos = [
  'En el marco de la celebración por los 202 años de creación de la provincia de Manabí, durante la Sesión Solemne del Gobierno Provincial de Manabí, el señor Prefecto Ec. Leonardo Orlando, realizó un reconocimiento a la labor social que viene desarrollando FUNADELÁN durante sus 23 años de trayectoria, destacando nuestro compromiso permanente con el bienestar de la comunidad.',
  'Este reconocimiento también resalta la creación del Centro de Atención Integral Manabí Humano Angeluz, un espacio de servicio y esperanza que brinda atención especializada en terapia física, terapia de lenguaje, psicología y odontología; además, de manera itinerante, ofrece servicios de medicina general, oftalmología y nutrición desde nuestra sede ubicada en El Limón.',
  'Seguimos caminando con fe y compromiso, diseñando y fortaleciendo alianzas estratégicas que nos permitan continuar avanzando en el sueño de crear un Centro de Atención, Formación e Investigación para el Adulto Mayor, un proyecto pensado para servir, acompañar y transformar vidas.',
  'En nombre de la Directiva de FUNADELÁN expresamos nuestro profundo agradecimiento por este reconocimiento y por cada persona e institución que se suma a esta hermosa misión de servir.',
  'FUNADELÁN: «Vivir para servir»',
];

const bloques = parrafos.map((t, i) => ({
  _type: 'block',
  _key: `b${i}`,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `s${i}`, text: t, marks: [] }],
}));

(async () => {
  const archivos = readdirSync(CARPETA)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  const imagenes = [];
  for (let i = 0; i < archivos.length; i++) {
    const ruta = join(CARPETA, archivos[i]);
    const asset = await client.assets.upload('image', createReadStream(ruta), {
      filename: basename(ruta),
    });
    imagenes.push({ _type: 'image', _key: `img${i}`, asset: { _type: 'reference', _ref: asset._id } });
    console.log(`  · imagen subida: ${archivos[i]}`);
  }

  await client.createOrReplace({
    _id: 'post-centro-atencion-integral',
    _type: 'post',
    titulo: 'Centro de Atención Integral Manabí Humano Angeluz',
    slug: { _type: 'slug', current: 'centro-de-atencion-integral' },
    fecha: '2026-06-26T12:00:00.000Z',
    autor: 'Fabricio Alaña, SJ',
    resumen:
      'El Gobierno Provincial de Manabí reconoció los 23 años de labor social de FUNADELÁN y la creación del Centro de Atención Integral Manabí Humano Angeluz.',
    contenido: bloques,
    imagenes,
    destacado: true,
  });

  console.log(`OK Publicación creada con ${imagenes.length} imágenes.`);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
