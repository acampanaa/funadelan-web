/**
 * Plantilla común de los correos de FUNADELÁN (bienvenida y boletín).
 *
 * El HTML de correo no es HTML de web: Outlook sigue usando el motor de Word,
 * Gmail recorta las hojas de estilo y casi ningún cliente admite tipografías
 * externas. Por eso aquí todo va con tablas, estilos en línea, anchos fijos y
 * familias tipográficas que ya existen en el sistema.
 *
 * Se importa desde dos sitios distintos:
 *   - src/pages/api/suscribir.ts     (correo de bienvenida)
 *   - netlify/functions/boletin-webhook.mjs  (boletín de cada publicación)
 */

/**
 * URL base de la que cuelgan el logo y los enlaces del correo.
 *
 * Tiene que ser absoluta y pública: un cliente de correo no puede resolver
 * rutas relativas ni llegar a localhost. Mientras el dominio definitivo no
 * esté publicado, se puede apuntar al de Netlify con PUBLIC_SITE_URL para que
 * el logo se vea en las pruebas.
 */
const SITIO = (process.env.PUBLIC_SITE_URL || 'https://funadelan.org').replace(/\/$/, '');

/** Paleta tomada de src/styles/global.css. */
const C = {
  terracota: '#7d2814',
  terracotaClaro: '#ad3d1e',
  tinta: '#211f1c',
  tintaSuave: '#6b6560',
  dorado: '#d4af37',
  crema: '#faf7f2',
  arena: '#ded7ce',
  blanco: '#ffffff',
};

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Arma un correo completo a partir de sus piezas.
 *
 * @param {object} opts
 * @param {string} opts.titulo        Encabezado principal, ya escapado.
 * @param {string} opts.preheader     Texto de vista previa en la bandeja.
 * @param {string} opts.cuerpoHtml    Párrafos del cuerpo (HTML ya escapado).
 * @param {{texto: string, url: string}} [opts.cta]  Botón opcional.
 * @param {string} [opts.cita]        Frase destacada opcional.
 * @param {string} [opts.notaPie]     Línea extra en el pie (p. ej. baja).
 */
export function plantillaCorreo({ titulo, preheader, cuerpoHtml, cta, cita, notaPie }) {
  const boton = cta
    ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 8px">
                <tr>
                  <td align="center" bgcolor="${C.terracota}" style="border-radius:4px">
                    <a href="${cta.url}"
                       style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:16px;font-weight:bold;color:${C.blanco};text-decoration:none;border-radius:4px">
                      ${cta.texto}
                    </a>
                  </td>
                </tr>
              </table>`
    : '';

  const bloqueCita = cita
    ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 0">
                <tr>
                  <td style="border-left:3px solid ${C.dorado};padding:4px 0 4px 18px;font-family:${SERIF};font-size:17px;font-style:italic;line-height:1.6;color:${C.terracota}">
                    ${cita}
                  </td>
                </tr>
              </table>`
    : '';

  const pieExtra = notaPie
    ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.tintaSuave}">${notaPie}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${C.crema}">
  <!-- Texto de vista previa: se ve en la lista de la bandeja, no en el correo. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${preheader}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.crema}">
    <tr>
      <td align="center" style="padding:32px 16px">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
               style="width:100%;max-width:600px;background-color:${C.blanco};border:1px solid ${C.arena};border-radius:6px">

          <!-- Cabecera con el logo -->
          <tr>
            <td align="center" style="padding:36px 32px 8px;background-color:${C.crema};border-radius:6px 6px 0 0">
              <a href="${SITIO}" style="text-decoration:none">
                <img src="${SITIO}/logo.png" width="132" height="132" alt="FUNADELÁN — Fundación Amigos de los Ángeles"
                     style="display:block;width:132px;height:132px;border:0;outline:none">
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 28px;background-color:${C.crema}">
              <div style="font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.terracotaClaro}">
                Fundación Amigos de los Ángeles
              </div>
            </td>
          </tr>

          <!-- Filete dorado -->
          <tr>
            <td style="height:3px;background-color:${C.dorado};font-size:0;line-height:0">&nbsp;</td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:40px 40px 36px">
              <h1 style="margin:0 0 20px;font-family:${SERIF};font-size:28px;font-weight:normal;line-height:1.3;color:${C.terracota}">
                ${titulo}
              </h1>
              ${cuerpoHtml}
              ${bloqueCita}
              ${boton}
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="padding:24px 40px 32px;background-color:${C.crema};border-top:1px solid ${C.arena};border-radius:0 0 6px 6px">
              <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.tintaSuave}">
                <strong style="color:${C.tinta}">FUNADELÁN</strong> · Portoviejo, Manabí, Ecuador<br>
                <a href="${SITIO}" style="color:${C.terracotaClaro};text-decoration:underline">funadelan.org</a>
              </p>
              ${pieExtra}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Un párrafo del cuerpo, con los estilos ya aplicados. */
export function parrafo(html) {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${C.tinta}">${html}</p>`;
}

export { SITIO };
