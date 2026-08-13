import type { APIRoute } from 'astro';
// @ts-expect-error — módulo .mjs compartido con la función de Netlify.
import { plantillaCorreo, parrafo, apunte, ficha, escapeHtml, SITIO } from '@/lib/emails.mjs';

// Endpoint del formulario de voluntariado.
//
// Antes el formulario usaba Netlify Forms, que detecta formularios analizando
// el HTML estático del despliegue. Esta página se renderiza en el servidor, así
// que nunca llegó a registrarse: las solicitudes no le llegaban a nadie. Ahora
// va por el mismo camino que contacto —Brevo— y además deja al voluntario
// anotado en su lista, para que no dependa de que alguien vea el correo.
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
  // Acepta envío de formulario o JSON. Si llega como formulario —JavaScript
  // desactivado o caído— se responde con una redirección en vez de JSON, para
  // que el visitante vea la página de gracias y no un volcado de texto.
  const tipo = request.headers.get('content-type') || '';
  const esFormulario = !tipo.includes('application/json');

  let datos: Record<string, string> = {};
  if (esFormulario) {
    const form = await request.formData();
    datos = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  } else {
    datos = await request.json().catch(() => ({}));
  }

  // Honeypot anti-spam: si viene relleno, fingimos éxito y descartamos.
  if (datos['bot-field']) {
    return esFormulario ? redirigir() : json({ ok: true });
  }

  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim();
  const area = (datos.area_de_interes || '').trim();
  const disponibilidad = (datos.disponibilidad || '').trim();
  const mensaje = (datos.mensaje || '').trim();

  // El prefijo viaja aparte del número; en el correo interesa junto.
  const digitos = (datos.telefono || '').replace(/\D/g, '').slice(0, 10);
  const prefijo = (datos.prefijo || '').trim();
  const telefono = digitos ? `${prefijo} ${digitos}`.trim() : '';

  if (!nombre || !esEmailValido(email) || !area) {
    return json({ ok: false, error: 'Completa tu nombre, un correo válido y el área de interés.' }, 400);
  }

  const apiKey = env('BREVO_API_KEY');
  const senderEmail = env('BREVO_SENDER_EMAIL');
  const senderName = env('BREVO_SENDER_NAME') || 'FUNADELÁN';
  const destino = env('CONTACTO_EMAIL_DESTINO') || senderEmail;
  const listaVoluntarios = env('BREVO_LIST_VOLUNTARIOS_ID');

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

  // 1. Aviso a la fundación. Es el paso que no puede fallar en silencio: si no
  //    sale, se le dice al visitante para que pueda escribir por otra vía.
  const htmlAviso = plantillaCorreo({
    titulo: escapeHtml(nombre),
    etiqueta: 'Nueva solicitud de voluntariado',
    preheader: `${escapeHtml(nombre)} quiere ayudar en: ${escapeHtml(area)}`,
    cuerpoHtml: [
      ficha([
        ['Nombre', escapeHtml(nombre)],
        ['Correo', `<a href="mailto:${escapeHtml(email)}" style="color:#ad3d1e">${escapeHtml(email)}</a>`],
        ['Teléfono', telefono ? escapeHtml(telefono) : ''],
        ['Área', escapeHtml(area)],
        ['Disponibilidad', disponibilidad ? escapeHtml(disponibilidad) : ''],
      ]),
      mensaje ? apunte('Nos cuenta:') : '',
      mensaje ? parrafo(conSaltos(mensaje)) : '',
    ].join(''),
    cta: {
      texto: 'Responder',
      url: `mailto:${email}?subject=${encodeURIComponent('Sobre tu solicitud de voluntariado — FUNADELÁN')}`,
    },
    notaPie: 'Solicitud enviada desde el formulario de voluntariado de funadelan.org.',
  });

  try {
    const resAviso = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: destino }],
        replyTo: { email, name: nombre },
        subject: `🤝 Voluntariado: ${nombre}`,
        htmlContent: htmlAviso,
      }),
    });
    if (!resAviso.ok) {
      console.error('Brevo aviso voluntariado:', await resAviso.text());
      return json({ ok: false, error: 'No se pudo enviar la solicitud. Intenta más tarde.' }, 502);
    }
  } catch (e) {
    console.error('Error de red (aviso voluntariado):', e);
    return json({ ok: false, error: 'No se pudo conectar con el servicio de correo.' }, 502);
  }

  // 2. Anotar al voluntario en su lista de Brevo. No bloquea: el aviso ya salió
  //    y perder la solicitud por un fallo aquí sería peor que no tener lista.
  if (listaVoluntarios) {
    try {
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: cabeceras,
        body: JSON.stringify({
          email,
          updateEnabled: true,
          listIds: [Number(listaVoluntarios)],
          attributes: {
            FIRSTNAME: nombre,
            TELEFONO: telefono,
            AREA_VOLUNTARIADO: area,
            DISPONIBILIDAD: disponibilidad,
          },
        }),
      });
    } catch (e) {
      console.error('Error al anotar al voluntario en Brevo (no crítico):', e);
    }
  }

  // 3. Acuse de recibo para el voluntario (tampoco bloquea).
  const htmlAcuse = plantillaCorreo({
    titulo: 'Recibimos tu solicitud',
    etiqueta: 'Gracias por querer ayudar',
    preheader: 'Nos pondremos en contacto contigo para coordinar los próximos pasos.',
    cuerpoHtml: [
      parrafo(`Hola, ${escapeHtml(nombre)}:`),
      parrafo(
        'Gracias por ofrecer tu tiempo a la <strong>Fundación Amigos de los Ángeles</strong>. ' +
          'Recibimos tu solicitud y nos pondremos en contacto contigo para coordinar los próximos pasos.',
      ),
      apunte('Esto fue lo que nos indicaste:'),
      ficha([
        ['Área', escapeHtml(area)],
        ['Disponibilidad', disponibilidad ? escapeHtml(disponibilidad) : ''],
      ]),
    ].join(''),
    cita: '«La vida solo tiene sentido cuando se la entrega, se la dona.»',
    cta: { texto: 'Conocer la fundación', url: `${SITIO}/quienes-somos` },
    notaPie:
      'Este es un acuse automático del formulario de voluntariado de funadelan.org. ' +
      'Puedes responder a este correo si quieres añadir algo.',
  });

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: nombre }],
        replyTo: { email: destino },
        subject: 'Recibimos tu solicitud de voluntariado — FUNADELÁN',
        htmlContent: htmlAcuse,
      }),
    });
  } catch (e) {
    console.error('Error de red (acuse voluntariado, no crítico):', e);
  }

  return esFormulario
    ? redirigir()
    : json({ ok: true, mensaje: '¡Solicitud enviada! Nos pondremos en contacto contigo.' });
};

/** Lleva a la página de voluntariado, que muestra el mensaje de gracias. */
function redirigir() {
  return new Response(null, {
    status: 303,
    headers: { location: '/colabora/voluntariado?enviado=1' },
  });
}
