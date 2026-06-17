// Función serverless: recibe el webhook de Sanity al publicar una noticia
// y dispara el envío del boletín vía la API de Brevo.
//
// Flujo (sección 5 del documento de arquitectura):
//   Sanity publica noticia -> webhook -> esta función -> API Brevo -> suscriptores.
//
// Variables de entorno requeridas (configurar en Netlify):
//   SANITY_WEBHOOK_SECRET  -> para validar el origen del webhook
//   BREVO_API_KEY          -> clave de API de Brevo
//   BREVO_LIST_ID          -> id de la lista de suscriptores
//   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET -> para enlaces

import { createHmac } from 'node:crypto';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  const raw = await req.text();

  // 1. Validar firma del webhook de Sanity (cabecera sanity-webhook-signature).
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (secret) {
    const signatureHeader = req.headers.get('sanity-webhook-signature') || '';
    if (!isValidSanitySignature(raw, signatureHeader, secret)) {
      return new Response('Firma inválida', { status: 401 });
    }
  }

  let noticia;
  try {
    noticia = JSON.parse(raw);
  } catch {
    return new Response('Cuerpo inválido', { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    console.warn('Brevo no configurado; se omite el envío.');
    return new Response(JSON.stringify({ ok: false, reason: 'brevo-no-configurado' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // 2. Crear y programar el envío de una campaña con los datos de la noticia.
  const titulo = noticia.titulo ?? 'Nueva publicación';
  const resumen = noticia.resumen ?? '';
  const enlace = `https://funadelan.org/noticias/${noticia.slug ?? ''}`;

  const html = `
    <h1 style="font-family:Georgia,serif;color:#18335a">${escapeHtml(titulo)}</h1>
    <p style="font-size:16px;line-height:1.7;color:#1f2733">${escapeHtml(resumen)}</p>
    <p><a href="${enlace}" style="display:inline-block;background:#e0a730;color:#142a4a;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Leer más</a></p>
  `;

  const res = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      name: `Boletín — ${titulo}`,
      subject: titulo,
      sender: { name: 'FUNADELÁN', email: 'boletin@funadelan.org' },
      htmlContent: `<html><body>${html}</body></html>`,
      recipients: { listIds: [Number(listId)] },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Error de Brevo:', detail);
    return new Response('Error al crear la campaña', { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

function isValidSanitySignature(payload, header, secret) {
  // Cabecera: "t=<timestamp>,v1=<hmac>"
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac('sha256', secret)
    .update(`${parts.t}.${payload}`)
    .digest('base64url');
  return expected === parts.v1;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
