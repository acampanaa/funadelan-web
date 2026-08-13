import type { APIRoute } from 'astro';
// @ts-expect-error — módulo .mjs compartido con la función de Netlify.
import { plantillaCorreo, parrafo, escapeHtml, SITIO } from '@/lib/emails.mjs';

// Endpoint de suscripción al boletín (RF-17).
// Se ejecuta en el servidor (no se pre-renderiza) tanto en `npm run dev`
// como en Netlify. Recibe un correo, lo agrega a la lista de Brevo y envía
// un email de bienvenida/confirmación.
export const prerender = false;

const env = (k: string) => import.meta.env[k] ?? process.env[k];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const esEmailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const POST: APIRoute = async ({ request }) => {
  // Acepta tanto envío de formulario como JSON.
  let email = '';
  let nombre = '';
  const tipo = request.headers.get('content-type') || '';
  if (tipo.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    email = (body.email || '').trim();
    nombre = (body.nombre || '').trim();
  } else {
    const form = await request.formData();
    email = String(form.get('email') || '').trim();
    nombre = String(form.get('nombre') || '').trim();
  }

  if (!esEmailValido(email)) {
    return json({ ok: false, error: 'Ingresa un correo válido.' }, 400);
  }

  const apiKey = env('BREVO_API_KEY');
  const listId = env('BREVO_LIST_ID');
  const senderEmail = env('BREVO_SENDER_EMAIL');
  const senderName = env('BREVO_SENDER_NAME') || 'FUNADELÁN';

  if (!apiKey || !senderEmail) {
    return json(
      {
        ok: false,
        error:
          'El envío de correos no está configurado todavía (falta BREVO_API_KEY o BREVO_SENDER_EMAIL en .env).',
      },
      503,
    );
  }

  const cabeceras = {
    'api-key': apiKey,
    'content-type': 'application/json',
    accept: 'application/json',
  };

  // 1. Agregar el contacto a la lista de Brevo (si ya existe, lo actualiza).
  try {
    const resContacto = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        email,
        attributes: nombre ? { NOMBRE: nombre } : undefined,
        listIds: listId ? [Number(listId)] : undefined,
        updateEnabled: true,
      }),
    });
    // 201 = creado, 204 = actualizado. Otro código que no sea "ya existe" => error.
    if (!resContacto.ok && resContacto.status !== 204) {
      const detalle = await resContacto.json().catch(() => ({}));
      if (detalle?.code !== 'duplicate_parameter') {
        console.error('Brevo contacto:', detalle);
        return json({ ok: false, error: 'No se pudo registrar el correo.' }, 502);
      }
    }
  } catch (e) {
    console.error('Error de red (contacto):', e);
    return json({ ok: false, error: 'No se pudo conectar con el servicio de correo.' }, 502);
  }

  // 2. Enviar el correo de bienvenida / confirmación de suscripción.
  const saludo = nombre ? `Hola, ${escapeHtml(nombre)}:` : 'Hola:';
  const html = plantillaCorreo({
    titulo: 'Te damos la bienvenida',
    preheader: 'Gracias por suscribirte al boletín de la Fundación Amigos de los Ángeles.',
    cuerpoHtml: [
      parrafo(saludo),
      parrafo(
        'Gracias por suscribirte al boletín de la <strong>Fundación Amigos de los Ángeles</strong>. ' +
          'Desde ahora te llegarán a este correo nuestras publicaciones: actividades del Centro ' +
          'Diurno «Ángeluz», que cuenta con el respaldo del Gobierno Provincial de Manabí, ' +
          'noticias de la fundación y mensajes de esperanza.',
      ),
      parrafo('Nos alegra tenerte cerca.'),
    ].join(''),
    cita: '«La vida solo tiene sentido cuando se la entrega, se la dona.»',
    cta: { texto: 'Conocer la fundación', url: `${SITIO}/quienes-somos` },
    notaPie:
      'Recibes este correo porque te suscribiste en funadelan.org. Si no fuiste tú o ya no ' +
      `quieres recibirlo, escríbenos a <a href="mailto:${senderEmail}" style="color:#ad3d1e">${senderEmail}</a> y te damos de baja.`,
  });

  try {
    const resCorreo = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: nombre || undefined }],
        subject: 'Te damos la bienvenida — FUNADELÁN',
        htmlContent: html,
      }),
    });
    if (!resCorreo.ok) {
      const detalle = await resCorreo.text();
      console.error('Brevo correo:', detalle);
      return json(
        { ok: false, error: 'Te registramos, pero no se pudo enviar el correo de confirmación.' },
        502,
      );
    }
  } catch (e) {
    console.error('Error de red (correo):', e);
    return json({ ok: false, error: 'No se pudo enviar el correo de confirmación.' }, 502);
  }

  return json({ ok: true, mensaje: '¡Listo! Revisa tu correo para confirmar la suscripción.' });
};
