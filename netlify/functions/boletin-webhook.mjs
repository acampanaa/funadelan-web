// Función serverless: recibe el webhook de Sanity al publicar una noticia o
// una publicación, y envía el boletín a los suscriptores vía la API de Brevo.
//
// Flujo: Sanity publica -> webhook -> esta función -> API Brevo -> suscriptores.
//
// Variables de entorno requeridas (configurar en Netlify):
//   SANITY_WEBHOOK_SECRET  -> obligatoria; valida que el webhook venga de Sanity
//   BREVO_API_KEY          -> clave de API de Brevo
//   BREVO_LIST_ID          -> id de la lista de suscriptores
//   BREVO_SENDER_EMAIL     -> remitente verificado en Brevo
//   BREVO_SENDER_NAME      -> nombre visible del remitente (opcional)

import { createHmac, timingSafeEqual } from 'node:crypto';
import { plantillaCorreo, parrafo, escapeHtml, SITIO } from '../../src/lib/emails.mjs';

/** Ruta pública según el tipo de documento de Sanity. */
const RUTAS = {
  post: 'posts',
  noticia: 'noticias',
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

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !listId || !senderEmail) {
    console.warn('Brevo no configurado; se omite el envío.');
    return new Response(JSON.stringify({ ok: false, motivo: 'brevo-no-configurado' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 2. Armar el correo.
  const titulo = doc.titulo ?? 'Nueva publicación';
  const resumen = doc.resumen ?? '';
  // El slug de Sanity llega como objeto ({_type:'slug', current:'…'}) salvo que
  // el webhook lo proyecte a texto; se admiten las dos formas.
  const slug = typeof doc.slug === 'string' ? doc.slug : (doc.slug?.current ?? '');
  const seccion = RUTAS[doc._type] ?? 'noticias';
  const enlace = `${SITIO}/${seccion}/${encodeURIComponent(slug)}`;

  const cuerpo = resumen
    ? parrafo(escapeHtml(resumen))
    : parrafo('Acabamos de publicar algo nuevo en nuestra página.');

  const html = plantillaCorreo({
    titulo: escapeHtml(titulo),
    preheader: resumen ? escapeHtml(resumen).slice(0, 140) : escapeHtml(titulo),
    cuerpoHtml: cuerpo,
    cta: { texto: 'Leer la publicación', url: enlace },
    notaPie: 'Recibes este correo porque te suscribiste al boletín en funadelan.org.',
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
      name: `Boletín — ${titulo} — ${new Date().toISOString()}`,
      subject: titulo,
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

  return new Response(JSON.stringify({ ok: true, campanaId: id }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

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
