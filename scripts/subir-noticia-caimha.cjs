// Sube la foto de la entrevista y publica la noticia de la inauguración del
// Centro de Atención Integral Manabí Humano Angeluz (CAIMHA).
// Fuente: entrevista al padre Fabricio Alaña, SJ, publicada en El Diario.
//   npx sanity exec scripts/subir-noticia-caimha.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream, existsSync } = require('node:fs');

const client = getCliClient({ apiVersion: '2024-12-01' });

const IMAGEN = 'inauguracion.jpg';
const FUENTE =
  'https://www.eldiario.ec/portoviejo/el-lunes-20-de-abril-sera-inaugurado-el-centro-de-atencion-integral-manabi-humano-angeluz-en-el-sector-el-limon-con-servicios-gratuitos-de-salud-17042026/';

const parrafos = [
  'El Centro de Atención Integral Manabí Humano Angeluz (CAIMHA) fue inaugurado el lunes 20 de abril en la sede de FUNADELÁN, en el sector El Limón, parroquia Simón Bolívar de Portoviejo, a cien metros de la iglesia del sector. La apertura coincidió con los 120 años del prodigio de la Virgen Dolorosa.',
  'El centro ofrece fisioterapia, terapia de lenguaje, terapia ocupacional, psicología y odontología. La rehabilitación física es uno de sus componentes principales y cuenta con equipos de magnetoterapia, ultrasonido y electroestimulación, adquiridos con un aporte de 15 mil dólares del Gobierno Provincial de Manabí.',
  'La atención es gratuita, con prioridad para las personas adultas mayores y quienes se encuentran en situación de vulnerabilidad. El horario es de lunes a viernes, de 08h00 a 17h00, y el ingreso se realiza por turnos según el orden de llegada.',
  'El servicio está dirigido a las comunidades cercanas —El Guabito, Colón, Estancia Vieja y Los Ángeles—, aunque puede acudir cualquier persona de Manabí o de otras provincias. En esta primera fase el Gobierno Provincial financia al equipo de profesionales y FUNADELÁN se encarga de la administración, el mantenimiento y la difusión del centro.',
  'El proyecto continúa: entre las metas están un salón multiuso tipo auditorio y nuevos espacios de espera y descanso para quienes llegan a atenderse.',
];

const bloques = parrafos.map((texto, i) => ({
  _type: 'block',
  _key: `b${i}`,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `s${i}`, text: texto, marks: [] }],
}));

bloques.push({
  _type: 'block',
  _key: 'fuente',
  style: 'normal',
  markDefs: [{ _type: 'link', _key: 'l0', href: FUENTE }],
  children: [
    { _type: 'span', _key: 'sf0', text: 'Entrevista al padre Fabricio Alaña, SJ, en ', marks: [] },
    { _type: 'span', _key: 'sf1', text: 'El Diario', marks: ['l0'] },
    { _type: 'span', _key: 'sf2', text: '.', marks: [] },
  ],
});

(async () => {
  if (!existsSync(IMAGEN)) throw new Error(`No existe ${IMAGEN} en la raíz del proyecto`);

  const asset = await client.assets.upload('image', createReadStream(IMAGEN), {
    filename: 'caimha-inauguracion.jpg',
  });
  console.log('  · imagen subida');

  await client.createOrReplace({
    _id: 'noticia-caimha-inauguracion',
    _type: 'noticia',
    titulo: 'El Centro CAIMHA abre en El Limón con servicios gratuitos de salud',
    slug: { _type: 'slug', current: 'centro-caimha-el-limon' },
    fecha: '2026-04-17T12:00:00.000Z',
    resumen:
      'FUNADELÁN y el Gobierno Provincial de Manabí inauguraron el Centro de Atención Integral Manabí Humano Angeluz: fisioterapia, terapia de lenguaje, terapia ocupacional, psicología y odontología, gratuitas, en la sede de El Limón.',
    imagen: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    cuerpo: bloques,
    destacada: false,
  });

  console.log('OK Noticia creada: /noticias/centro-caimha-el-limon');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
