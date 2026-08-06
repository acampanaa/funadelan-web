// Sube las publicaciones de RECURSOS FACEBOOK/PUBLICACIONES que todavía no
// existen en Sanity (el álbum "reconocimiento a la labor social" se omite
// porque ya está publicado como post-centro-atencion-integral).
//   npx sanity exec scripts/subir-publicaciones-facebook.cjs --with-user-token
const { getCliClient } = require('sanity/cli');
const { createReadStream, readdirSync, existsSync } = require('node:fs');
const { join, basename } = require('node:path');

const client = getCliClient({ apiVersion: '2024-12-01' });

const BASE = 'RECURSOS FACEBOOK/PUBLICACIONES';

const bloques = (parrafos) =>
  parrafos.map((t, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text: t, marks: [] }],
  }));

const publicaciones = [
  {
    id: 'post-centro-formacion-investigacion-adulto-mayor',
    carpeta: 'Centro de Atención, Formación e Investigación para el Adulto Mayor de Portoviejo',
    titulo: 'Centro de Atención, Formación e Investigación para el Adulto Mayor',
    slug: 'centro-formacion-investigacion-adulto-mayor',
    fecha: '2026-03-10T12:00:00.000Z',
    autor: 'Fabricio Alaña, SJ',
    resumen:
      'FUNADELÁN se reunió con el Alcalde de Portoviejo, Javier Pincay, para impulsar el proyecto de un Centro de Atención, Formación e Investigación para el Adulto Mayor de Portoviejo y Manabí.',
    parrafos: [
      'Hoy, 10 de marzo, mantuvimos una reunión de trabajo con el Lcdo. Javier Pincay, Alcalde de Portoviejo, a quien agradecemos sinceramente por haber recibido con apertura y cordialidad a la directiva de FUNADELAN.',
      'En este encuentro compartimos nuestro sueño de continuar construyendo un Centro de Atención, Formación e Investigación para el Adulto Mayor de Portoviejo y Manabí, así como la importancia de generar alianzas estratégicas con gobiernos locales, universidades y fundaciones que permitan desarrollar y concretar esta propuesta en beneficio de nuestros adultos mayores.',
      'Gracias, Padre Dios, por los ángeles que pones en nuestro camino.',
    ],
  },
  {
    id: 'post-inauguracion-centro-caimha',
    carpeta: 'Inauguración Centro CAIMHA (Centro de Atención Integral Manabí Humano Angeluz)',
    titulo: 'Inauguración del Centro CAIMHA',
    slug: 'inauguracion-centro-caimha',
    fecha: '2026-04-21T12:00:00.000Z',
    autor: 'Fabricio Alaña, SJ',
    resumen:
      'FUNADELÁN y la Prefectura de Manabí inauguraron el Centro CAIMHA (Centro de Atención Integral Manabí Humano Angeluz), que ofrecerá terapia física, recreacional y ocupacional, psicología y odontología en El Limón, Portoviejo.',
    parrafos: [
      'En el día de nuestra Madre Dolorosa, 20 de abril, al conmemorar los 120 años de su prodigio y su mirada maternal sobre el Ecuador y la juventud, FUNADELAN y la Prefectura del Ec. Leonardo Orlando inauguramos y bendecimos el Centro CAIMHA (Centro de Atención Integral Manabí Humano Angeluz), con el propósito de brindar servicio a personas pobres y necesitadas.',
      'Este centro ofrecerá atención en terapia física, recreacional y ocupacional, psicología y odontología, en nuestra sede de FUNADELAN, ubicada en El Limón, parroquia Simón Bolívar de Portoviejo.',
      'Gracias a todos quienes contribuyen a construir sueños por un Manabí y un Ecuador mejor, más digno y saludable.',
      'La Directiva',
    ],
  },
  {
    id: 'post-la-mision-de-funadelan',
    carpeta: 'misión de FUNADELAN',
    titulo: 'La misión de FUNADELÁN',
    slug: 'la-mision-de-funadelan',
    fecha: '2026-03-02T12:00:00.000Z',
    autor: 'Fabricio Alaña, SJ',
    resumen:
      'Un momento especial compartido gracias a personas nobles y desinteresadas que hacen posible la misión de FUNADELÁN: acompañar y servir con amor.',
    parrafos: [
      'La memoria agradecida por la vida nos invita siempre a reconocer cada gesto de cariño recibido, de quienes nos enseñaron a amar, a valorar la amistad y a vivir con sentido y alegría.',
      'Este 28 de febrero, gracias a personas nobles y desinteresadas, y a la misión de FUNADELAN, compartimos un momento verdaderamente especial. Las fotos hablan por sí solas.',
    ],
  },
];

(async () => {
  for (const pub of publicaciones) {
    const carpetaAbs = join(BASE, pub.carpeta);
    let archivos = [];
    if (existsSync(carpetaAbs)) {
      archivos = readdirSync(carpetaAbs)
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
        .sort();
    }

    const imagenes = [];
    for (let i = 0; i < archivos.length; i++) {
      const ruta = join(carpetaAbs, archivos[i]);
      const asset = await client.assets.upload('image', createReadStream(ruta), {
        filename: basename(ruta),
      });
      imagenes.push({ _type: 'image', _key: `img${i}`, asset: { _type: 'reference', _ref: asset._id } });
      console.log(`  · imagen subida (${pub.slug}): ${archivos[i]}`);
    }

    await client.createOrReplace({
      _id: pub.id,
      _type: 'post',
      titulo: pub.titulo,
      slug: { _type: 'slug', current: pub.slug },
      fecha: pub.fecha,
      autor: pub.autor,
      resumen: pub.resumen,
      contenido: bloques(pub.parrafos),
      imagenes,
      destacado: true,
    });

    console.log(`OK "${pub.titulo}" creada con ${imagenes.length} imágenes.\n`);
  }
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
