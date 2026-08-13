import type { APIRoute } from 'astro';
// @ts-expect-error — módulo .mjs compartido con la función de Netlify.
import { plantillaCorreo, parrafo, apunte, ficha, escapeHtml, SITIO } from '@/lib/emails.mjs';

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

/** Texto del visitante listo para el correo: escapado y con sus saltos de línea. */
const conSaltos = (texto: string) => escapeHtml(texto).replace(/\r?\n/g, '<br>');

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
  // El formulario manda el prefijo aparte; en el correo interesa el número
  // completo y marcable de una vez.
  const soloDigitos = (datos.telefono || '').replace(/\D/g, '').slice(0, 10);
  const prefijo = (datos.prefijo || '').trim();
  const telefono = soloDigitos ? `${prefijo} ${soloDigitos}`.trim() : '';
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
  //    El botón abre el correo del visitante ya en respuesta: en el móvil, que
  //    es donde se leen estos avisos, ahorra copiar la dirección a mano.
  const htmlAviso = plantillaCorreo({
    titulo: escapeHtml(asunto),
    etiqueta: 'Nuevo mensaje de contacto',
    preheader: `${escapeHtml(nombre)}: ${escapeHtml(mensaje).slice(0, 120)}`,
    cuerpoHtml: [
      ficha([
        ['Nombre', escapeHtml(nombre)],
        ['Correo', `<a href="mailto:${escapeHtml(email)}" style="color:#ad3d1e">${escapeHtml(email)}</a>`],
        ['Teléfono', telefono ? escapeHtml(telefono) : ''],
      ]),
      parrafo(conSaltos(mensaje)),
    ].join(''),
    cta: {
      texto: 'Responder',
      url: `mailto:${email}?subject=${encodeURIComponent(`Re: ${asunto}`)}`,
    },
    notaPie: 'Mensaje enviado desde el formulario de contacto de funadelan.org.',
  });

  try {
    const resAviso = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: destino }],
        replyTo: { email, name: nombre },
        subject: `📩 Contacto: ${asunto}`,
        htmlContent: htmlAviso,
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
  const htmlAcuse = plantillaCorreo({
    titulo: 'Recibimos tu mensaje',
    etiqueta: 'Gracias por escribirnos',
    preheader: 'Hemos recibido tu mensaje y te responderemos pronto.',
    cuerpoHtml: [
      parrafo(`Hola, ${escapeHtml(nombre)}:`),
      parrafo(
        'Gracias por escribir a la <strong>Fundación Amigos de los Ángeles</strong>. ' +
          'Tu mensaje ya está con nosotros y te responderemos lo antes posible.',
      ),
      apunte('Esto fue lo que nos enviaste:'),
      ficha([['Asunto', escapeHtml(asunto)], ['Mensaje', conSaltos(mensaje)]]),
    ].join(''),
    cta: { texto: 'Conocer la fundación', url: `${SITIO}/quienes-somos` },
    notaPie:
      'Este es un acuse automático del formulario de contacto de funadelan.org. ' +
      'Puedes responder a este correo si quieres añadir algo.',
  });

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: nombre }],
        subject: 'Recibimos tu mensaje — FUNADELÁN',
        replyTo: { email: destino },
        htmlContent: htmlAcuse,
      }),
    });
  } catch (e) {
    console.error('Error de red (acuse, no crítico):', e);
  }

  return json({ ok: true, mensaje: '¡Mensaje enviado! Te responderemos pronto.' });
};
