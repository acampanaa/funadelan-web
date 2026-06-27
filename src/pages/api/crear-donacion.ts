import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// Endpoint de donaciones con Stripe Checkout.
// Recibe un monto, crea una sesión de Checkout en el servidor y devuelve la
// URL a la que el navegador debe redirigir. La transacción ocurre íntegramente
// en la pasarela de Stripe; el sitio nunca toca datos de tarjeta.
export const prerender = false;

const env = (k: string) => import.meta.env[k] ?? process.env[k];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// Límites razonables para una donación (en USD, moneda de Ecuador).
const MONTO_MIN = 1;
const MONTO_MAX = 10000;

export const POST: APIRoute = async ({ request }) => {
  const secret = env('STRIPE_SECRET_KEY');
  if (!secret) {
    return json(
      {
        ok: false,
        error:
          'Las donaciones con tarjeta no están configuradas todavía (falta STRIPE_SECRET_KEY en .env).',
      },
      503,
    );
  }

  let monto = 0;
  try {
    const body = await request.json();
    monto = Number(body?.monto);
  } catch {
    return json({ ok: false, error: 'Solicitud inválida.' }, 400);
  }

  if (!Number.isFinite(monto) || monto < MONTO_MIN || monto > MONTO_MAX) {
    return json(
      { ok: false, error: `Ingresa un monto entre $${MONTO_MIN} y $${MONTO_MAX}.` },
      400,
    );
  }

  // Stripe trabaja en la unidad mínima (centavos). Redondeamos por seguridad.
  const centavos = Math.round(monto * 100);
  const origen = new URL(request.url).origin;
  const stripe = new Stripe(secret);

  try {
    const sesion = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'donate',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: centavos,
            product_data: {
              name: 'Donación a FUNADELÁN',
              description: 'Fundación Amigos de los Ángeles — Portoviejo, Ecuador',
            },
          },
        },
      ],
      success_url: `${origen}/colabora/donar/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origen}/colabora/donar?cancelado=1`,
    });

    return json({ ok: true, url: sesion.url });
  } catch (e) {
    console.error('Error al crear la sesión de Stripe:', e);
    return json({ ok: false, error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, 502);
  }
};
