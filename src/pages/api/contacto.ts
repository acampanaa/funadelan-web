import type { APIRoute } from 'astro';

// Endpoint del formulario de contacto (RF-15 / RF-23).
// Recibe el mensaje, avisa por correo a la fundación (con responder-a hacia el
// visitante) y envía un acuse de recibo al visitante. Se ejecuta en servidor.
export const prerender = false;

const env = (k: string) => import.meta.env[k] ?? process.env[k];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const esEmailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeHtml = (str: string) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const POST: APIRoute = async ({ request }) => {
  // Acepta envío de formulario o JSON.
  let datos: Record<string, string> = {};
  const tipo = request.headers.get('content-type') || '';
  if (tipo.includes('application/json')) {
    datos = await request.json().catch(() => ({}));
  } else {
    const form = await request.formData();
    datos = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  }

  // Honeypot anti-spam: si viene relleno, fingimos éxito y descartamos.
  if (datos['bot-field']) {
    return json({ ok: true });
  }

  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim();
  const telefono = (datos.telefono || '').trim();
  const asunto = (datos.asunto || '').trim() || 'Mensaje desde el sitio web';
  const mensaje = (datos.mensaje || '').trim();

  if (!nombre || !esEmailValido(email) || !mensaje) {
    return json({ ok: false, error: 'Completa tu nombre, un correo válido y el mensaje.' }, 400);
  }

  const apiKey = env('BREVO_API_KEY');
  const senderEmail = env('BREVO_SENDER_EMAIL');
  const senderName = env('BREVO_SENDER_NAME') || 'FUNADELÁN';
  // A dónde llegan los mensajes; si no se define, al mismo remitente verificado.
  const destino = env('CONTACTO_EMAIL_DESTINO') || senderEmail;

  if (!apiKey || !senderEmail) {
    return json(
      {
        ok: false,
        error: 'El envío de correos no está configurado (falta BREVO_API_KEY o BREVO_SENDER_EMAIL).',
      },
      503,
    );
  }

  const cabeceras = {
    'api-key': apiKey,
    'content-type': 'application/json',
    accept: 'application/json',
  };

  // 1. Aviso a la fundación con los datos del mensaje (responder-a = visitante).
  const htmlAviso = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
      <h2 style="font-family:Georgia,serif;color:#5c2e1c">Nuevo mensaje de contacto</h2>
      <table style="font-size:15px;color:#2a2018;line-height:1.6">
        <tr><td style="padding:4px 12px 4px 0"><strong>Nombre:</strong></td><td>${escapeHtml(nombre)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Correo:</strong></td><td>${escapeHtml(email)}</td></tr>
        ${telefono ? `<tr><td style="padding:4px 12px 4px 0"><strong>Teléfono:</strong></td><td>${escapeHtml(telefono)}</td></tr>` : ''}
        <tr><td style="padding:4px 12px 4px 0"><strong>Asunto:</strong></td><td>${escapeHtml(asunto)}</td></tr>
      </table>
      <p style="font-size:15px;color:#2a2018;line-height:1.7;margin-top:16px;white-space:pre-wrap;border-left:3px solid #e0a730;padding-left:12px">${escapeHtml(mensaje)}</p>
    </div>`;

  try {
    const resAviso = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: destino }],
        replyTo: { email, name: nombre },
        subject: `📩 Contacto: ${asunto}`,
        htmlContent: `<html><body>${htmlAviso}</body></html>`,
      }),
    });
    if (!resAviso.ok) {
      const detalle = await resAviso.text();
      console.error('Brevo aviso contacto:', detalle);
      return json({ ok: false, error: 'No se pudo enviar el mensaje. Intenta más tarde.' }, 502);
    }
  } catch (e) {
    console.error('Error de red (aviso):', e);
    return json({ ok: false, error: 'No se pudo conectar con el servicio de correo.' }, 502);
  }

  // 2. Acuse de recibo para el visitante (no bloquea si falla).
  const htmlAcuse = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
      <h1 style="font-family:Georgia,serif;color:#5c2e1c">¡Gracias por escribirnos! ✦</h1>
      <p style="font-size:16px;line-height:1.7;color:#2a2018">
        Hola ${escapeHtml(nombre)}, recibimos tu mensaje y te responderemos pronto.
      </p>
      <p style="font-size:15px;color:#2a2018;line-height:1.6;background:#fbf3ec;border-radius:8px;padding:12px">
        <strong>Tu mensaje:</strong><br><span style="white-space:pre-wrap">${escapeHtml(mensaje)}</span>
      </p>
      <p style="font-size:14px;color:#6b7280">Fundación Amigos de los Ángeles · Portoviejo, Manabí, Ecuador</p>
    </div>`;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: nombre }],
        subject: 'Recibimos tu mensaje — FUNADELÁN',
        htmlContent: `<html><body>${htmlAcuse}</body></html>`,
      }),
    });
  } catch (e) {
    console.error('Error de red (acuse, no crítico):', e);
  }

  return json({ ok: true, mensaje: '¡Mensaje enviado! Te responderemos pronto.' });
};
