// Genera en tmp/boletin/ un HTML por cada tipo de boletín, con datos de
// ejemplo, para revisar el diseño en el navegador sin enviar nada a Brevo.
//   node scripts/previsualizar-boletin.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { plantillaCorreo, escapeHtml } from '../src/lib/emails.mjs';
import { CORREOS } from '../netlify/functions/boletin-webhook.mjs';

const EJEMPLOS = {
  noticia: {
    _type: 'noticia',
    titulo: 'El Centro CAIMHA abre en El Limón con servicios gratuitos de salud',
    slug: 'centro-caimha-el-limon',
    fecha: '2026-04-17T12:00:00.000Z',
    resumen:
      'FUNADELÁN y el Gobierno Provincial de Manabí inauguraron el Centro de Atención Integral Manabí Humano Angeluz: fisioterapia, psicología y odontología gratuitas en la sede de El Limón.',
  },
  post: {
    _type: 'post',
    titulo: 'Centro de Atención Integral Manabí Humano Angeluz',
    slug: 'centro-de-atencion-integral',
    fecha: '2026-06-26T12:00:00.000Z',
    autor: 'Fabricio Alaña, SJ',
    resumen:
      'El Gobierno Provincial de Manabí reconoció los 23 años de labor social de FUNADELÁN y la creación del Centro de Atención Integral.',
  },
  reflexion: {
    _type: 'reflexion',
    titulo: 'Juntando nuestras alas',
    slug: 'juntando-nuestras-alas',
    autor: 'Fabricio Alaña, SJ',
    extracto:
      'Servir no es dar lo que sobra, sino compartir el tiempo, la escucha y la presencia con quien camina a nuestro lado. En cada persona mayor hay una historia que sigue enseñándonos.',
  },
  evento: {
    _type: 'evento',
    titulo: 'Novena a la Virgen Dolorosa',
    slug: 'novena-virgen-dolorosa',
    tipo: 'espiritual',
    plantilla: 'estandar',
    fechaInicio: '2026-09-23T23:00:00.000Z',
    fechaFin: '2026-10-02T23:00:00.000Z',
    lugar: 'Sede de FUNADELÁN, El Limón, Portoviejo',
    resumen: 'Nueve días de oración en comunidad, abiertos a todas las familias del sector.',
  },
  evento_chocolate: {
    _type: 'evento',
    titulo: 'Chocolate para el Alma',
    slug: 'chocolate-para-el-alma',
    tipo: 'social',
    plantilla: 'chocolate',
    fechaInicio: '2026-11-15T20:00:00.000Z',
    lugar: 'Ceibo Real Hotel, Portoviejo',
    resumen:
      'Una noche de encuentro con música, chocolate y la compañía de quienes hacen posible la fundación.',
  },
  informe: {
    _type: 'informe',
    titulo: 'Informe de la Asamblea General 2025',
    anio: 2025,
    descripcion:
      'Resultados, cuentas y actividades de la fundación durante 2025, presentados ante la Asamblea General de socios.',
    archivo: 'https://cdn.sanity.io/files/ejemplo/informe-2025.pdf',
  },
};

mkdirSync('tmp/boletin', { recursive: true });

for (const [tipo, doc] of Object.entries(EJEMPLOS)) {
  const partes = CORREOS[doc._type](doc);
  const html = plantillaCorreo({
    titulo: escapeHtml(doc.titulo),
    etiqueta: partes.etiqueta,
    preheader: escapeHtml(partes.preheader || doc.resumen || doc.descripcion || doc.titulo).slice(0, 140),
    cuerpoHtml: partes.cuerpoHtml,
    cita: partes.cita,
    cta: partes.cta,
    notaPie: 'Recibes este correo porque te suscribiste al boletín en funadelan.org.',
  });

  writeFileSync(`tmp/boletin/${tipo}.html`, html);
  console.log(`${tipo}: "${partes.asunto}" -> tmp/boletin/${tipo}.html`);
}
