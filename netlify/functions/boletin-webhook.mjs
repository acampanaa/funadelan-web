// Función serverless: recibe el webhook de Sanity al publicar contenido y envía
// el boletín a los suscriptores vía la API de Brevo.
//
// Flujo: Sanity publica -> webhook -> esta función -> API Brevo -> suscriptores.
//
// Variables de entorno requeridas (configurar en Netlify):
//   SANITY_WEBHOOK_SECRET  -> obligatoria; valida que el webhook venga de Sanity
//   BREVO_API_KEY          -> clave de API de Brevo
//   BREVO_LIST_ID          -> id de la lista de suscriptores
//   BREVO_SENDER_EMAIL     -> remitente verificado en Brevo
//   BREVO_SENDER_NAME      -> nombre visible del remitente (opcional)
//
// El webhook de Sanity debe enviar esta proyección, que normaliza los campos de
// los distintos tipos de documento (y resuelve las referencias de imagen y PDF,
// que si no llegarían como _ref y no se podrían usar en el correo):
//
//   {
//     _id, _type, titulo, "slug": slug.current, fecha, autor, resumen,
//     descripcion, anio, lugar, tipo, plantilla, fechaInicio, fechaFin,
//     "imagen": coalesce(imagen.asset->url, imagenes[0].asset->url),
//     "archivo": archivo.asset->url,
//     "extracto": coalesce(
//       array::join(cuerpo[_type == "block"][0].children[].text, ""),
//       array::join(contenido[_type == "block"][0].children[].text, "")
//     )
//   }

import { createHmac, timingSafeEqual } from 'node:crypto';
import { plantillaCorreo, parrafo, apunte, imagen, ficha, escapeHtml, SITIO } from '../../src/lib/emails.mjs';

const PIE = 'Recibes este correo porque te suscribiste al boletín en funadelan.org.';

/**
 * Un armador por tipo de documento: cada contenido tiene campos distintos y
 * pide un correo distinto. Devuelven el asunto y las piezas de la plantilla.
 *
 * Las oraciones y los testimonios no están aquí a propósito: no tienen página
 * propia a la que enviar a nadie.
 */
const CORREOS = {
  noticia: (doc) => ({
    asunto: doc.titulo,
    etiqueta: 'Noticia',
    cuerpoHtml: [
      imagen({ url: doc.imagen, alt: doc.titulo }),
      doc.fecha ? apunte(fechaLarga(doc.fecha)) : '',
      parrafo(escapeHtml(doc.resumen || 'Acabamos de publicar una noticia en nuestra página.')),
    ].join(''),
    cta: { texto: 'Leer la noticia', url: `${SITIO}/noticias/${encodeURIComponent(doc.slug)}` },
  }),

  post: (doc) => ({
    asunto: doc.titulo,
    etiqueta: 'Publicación',
    cuerpoHtml: [
      imagen({ url: doc.imagen, alt: doc.titulo }),
      apunte(
        [doc.autor ? `Por ${escapeHtml(doc.autor)}` : '', doc.fecha ? fechaLarga(doc.fecha) : '']
          .filter(Boolean)
          .join(' · '),
      ),
      parrafo(escapeHtml(doc.resumen || doc.extracto || 'Acabamos de publicar algo nuevo en nuestra página.')),
    ].join(''),
    cta: { texto: 'Ver la publicación', url: `${SITIO}/posts/${encodeURIComponent(doc.slug)}` },
  }),

  // Reflexiones y mensajes: el texto manda. En vez de resumen —que este tipo no
  // tiene— se abre con las primeras líneas del propio escrito, destacadas.
  reflexion: (doc) => ({
    asunto: doc.titulo,
    etiqueta: 'Reflexión y mensaje',
    cuerpoHtml: [
      doc.autor ? apunte(`Por ${escapeHtml(doc.autor)}`) : '',
      parrafo('Compartimos contigo la reflexión de esta semana.'),
    ].join(''),
    cita: doc.extracto ? escapeHtml(recortar(doc.extracto, 260)) : '',
    cta: {
      texto: 'Leer la reflexión',
      url: `${SITIO}/espiritualidad/reflexiones/${encodeURIComponent(doc.slug)}`,
    },
  }),

  // Los eventos varían mucho entre sí, así que la plantilla se elige desde
  // Sanity (campo "plantilla") en vez de adivinarla por el título.
  evento: (doc) => (EVENTOS[doc.plantilla] ?? EVENTOS.estandar)(doc),

  // Rendición de cuentas: el informe es un PDF y no tiene página propia, así que
  // el botón descarga el archivo y el cuerpo enlaza la sección.
  informe: (doc) => ({
    asunto: `Rendición de cuentas ${doc.anio ?? ''}`.trim(),
    etiqueta: 'Rendición de cuentas',
    cuerpoHtml: [
      parrafo(
        escapeHtml(
          doc.descripcion ||
            'Publicamos un nuevo informe de rendición de cuentas. Puedes consultarlo y descargarlo cuando quieras.',
        ),
      ),
      parrafo(
        `También puedes verlo en <a href="${SITIO}/colabora/rendicion-de-cuentas" style="color:#ad3d1e">la sección de rendición de cuentas</a> de la página.`,
      ),
    ].join(''),
    cta: doc.archivo
      ? { texto: 'Descargar el informe (PDF)', url: doc.archivo }
      : { texto: 'Ver la rendición de cuentas', url: `${SITIO}/colabora/rendicion-de-cuentas` },
  }),
};

// Se exporta para poder previsualizar los correos sin tocar Brevo:
//   node scripts/previsualizar-boletin.mjs
export { CORREOS };

/** Plantillas de evento, elegidas con el campo "plantilla" de Sanity. */
const EVENTOS = {
  estandar: (doc) => ({
    asunto: `Te esperamos: ${doc.titulo}`,
    etiqueta: doc.tipo === 'espiritual' ? 'Evento espiritual' : 'Evento',
    cuerpoHtml: [
      imagen({ url: doc.imagen, alt: doc.titulo }),
      ficha([
        ['Cuándo', escapeHtml(rangoFechas(doc.fechaInicio, doc.fechaFin))],
        ['Dónde', doc.lugar ? escapeHtml(doc.lugar) : ''],
      ]),
      parrafo(escapeHtml(doc.resumen || 'Te invitamos a acompañarnos.')),
    ].join(''),
    cta: { texto: 'Ver el evento', url: `${SITIO}/espiritualidad/eventos` },
  }),

  // El evento del año: la invitación pesa más que el aviso, y conviene decir
  // para qué es lo recaudado, que es lo que mueve a la gente a ir.
  chocolate: (doc) => ({
    asunto: `Chocolate para el Alma${anio(doc.fechaInicio)} — te esperamos`,
    etiqueta: 'Nuestro evento del año',
    preheader: doc.resumen || 'Una noche para compartir y sostener el Centro Diurno Ángeluz.',
    cuerpoHtml: [
      imagen({ url: doc.imagen, alt: doc.titulo }),
      parrafo(
        'Llega otra vez nuestra noche más esperada. <strong>Chocolate para el Alma</strong> es el encuentro solidario con el que sostenemos buena parte del trabajo del año: cada asistente ayuda a que el Centro Diurno Ángeluz siga abierto.',
      ),
      ficha([
        ['Cuándo', escapeHtml(rangoFechas(doc.fechaInicio, doc.fechaFin))],
        ['Dónde', doc.lugar ? escapeHtml(doc.lugar) : ''],
      ]),
      doc.resumen ? parrafo(escapeHtml(doc.resumen)) : '',
      parrafo('Nos encantaría contar contigo. Ven, y trae a quien quieras sumar a esta causa.'),
    ].join(''),
    cita: 'Vivir para servir.',
    cta: { texto: 'Quiero acompañarles', url: `${SITIO}/espiritualidad/eventos` },
  }),
};

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  const raw = await req.text();

  // 1. Validar la firma del webhook.
  //
  // Esto falla a propósito si falta el secreto. Antes, cuando no estaba
  // configurado, la validación se saltaba entera: cualquiera que conociera la
  // URL podía disparar un envío masivo a toda la lista de suscriptores.
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Falta SANITY_WEBHOOK_SECRET; se rechaza el webhook.');
    return new Response('Webhook no configurado', { status: 500 });
  }
  if (!firmaValida(raw, req.headers.get('sanity-webhook-signature') || '', secret)) {
    return new Response('Firma inválida', { status: 401 });
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch {
    return new Response('Cuerpo inválido', { status: 400 });
  }

  // Un borrador no se anuncia: si el filtro del webhook los dejara pasar, aquí
  // se paran igual.
  if (String(doc._id || '').startsWith('drafts.')) {
    return respuesta({ ok: false, motivo: 'borrador' });
  }

  const armar = CORREOS[doc._type];
  if (!armar) {
    console.warn(`Tipo sin boletín: ${doc._type}`);
    return respuesta({ ok: false, motivo: 'tipo-sin-boletin', tipo: doc._type });
  }

  // Los tipos con página propia no sirven de nada sin slug: el correo saldría
  // con un enlace roto.
  if (doc._type !== 'informe' && !doc.slug) {
    console.error(`Documento ${doc._id} sin slug; no se envía.`);
    return respuesta({ ok: false, motivo: 'sin-slug' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !listId || !senderEmail) {
    console.warn('Brevo no configurado; se omite el envío.');
    return respuesta({ ok: false, motivo: 'brevo-no-configurado' });
  }

  // 2. Armar el correo según el tipo.
  const partes = armar(doc);
  const titulo = doc.titulo ?? 'Nueva publicación';
  const asunto = partes.asunto || titulo;

  const html = plantillaCorreo({
    titulo: escapeHtml(titulo),
    etiqueta: partes.etiqueta,
    preheader: escapeHtml(partes.preheader || doc.resumen || doc.descripcion || titulo).slice(0, 140),
    cuerpoHtml: partes.cuerpoHtml,
    cita: partes.cita,
    cta: partes.cta,
    notaPie: PIE,
  });

  const cabeceras = {
    'api-key': apiKey,
    'content-type': 'application/json',
    accept: 'application/json',
  };

  // 3. Crear la campaña. Ojo: esto la deja en borrador, no la envía.
  const resCrear = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      name: `${partes.etiqueta} — ${titulo} — ${new Date().toISOString()}`,
      subject: asunto,
      sender: { name: process.env.BREVO_SENDER_NAME || 'FUNADELÁN', email: senderEmail },
      htmlContent: html,
      recipients: { listIds: [Number(listId)] },
    }),
  });

  if (!resCrear.ok) {
    console.error('Error de Brevo al crear la campaña:', await resCrear.text());
    return new Response('Error al crear la campaña', { status: 502 });
  }

  const { id } = await resCrear.json();

  // 4. Enviarla. Sin este paso la campaña se queda en borrador dentro de Brevo
  //    y no le llega a nadie, que es justo lo que venía pasando.
  const resEnviar = await fetch(`https://api.brevo.com/v3/emailCampaigns/${id}/sendNow`, {
    method: 'POST',
    headers: cabeceras,
  });

  if (!resEnviar.ok) {
    console.error('Error de Brevo al enviar la campaña:', await resEnviar.text());
    return new Response('Campaña creada pero no enviada', { status: 502 });
  }

  return respuesta({ ok: true, tipo: doc._type, campanaId: id });
};

function respuesta(datos, status = 200) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** "20 de abril de 2026", en la hora de Ecuador. */
function fechaLarga(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Guayaquil',
  }).format(fecha);
}

/** "20 de abril de 2026, 15:00" */
function fechaConHora(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil',
  }).format(fecha);
}

/** " 2026" para pegar al asunto; cadena vacía si no hay fecha válida. */
function anio(iso) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : ` ${fecha.getUTCFullYear()}`;
}

function rangoFechas(inicio, fin) {
  if (!inicio) return '';
  return fin ? `${fechaConHora(inicio)} — ${fechaConHora(fin)}` : fechaConHora(inicio);
}

/** Corta en el último espacio para no partir una palabra por la mitad. */
function recortar(texto, limite) {
  const limpio = String(texto).trim();
  if (limpio.length <= limite) return limpio;
  const corte = limpio.slice(0, limite);
  return `${corte.slice(0, corte.lastIndexOf(' ')) || corte}…`;
}

function firmaValida(payload, header, secret) {
  // Cabecera: "t=<timestamp>,v1=<hmac>"
  const partes = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  if (!partes.t || !partes.v1) return false;

  const esperada = createHmac('sha256', secret)
    .update(`${partes.t}.${payload}`)
    .digest('base64url');

  // Comparación en tiempo constante para no filtrar la firma byte a byte.
  const a = Buffer.from(esperada);
  const b = Buffer.from(partes.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
