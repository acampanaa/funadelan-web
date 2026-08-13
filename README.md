# FUNADELÁN — Sitio web

Sitio web de la **Fundación Amigos de los Ángeles** (FUNADELÁN), Portoviejo, Manabí, Ecuador.

Sitio informativo (no transaccional, salvo donaciones) con panel de contenido para
un administrador no técnico. Pensado para presentarse en el evento **"Chocolate para
el Alma"** (15 de noviembre).

## Stack (Jamstack)
V
| Capa | Tecnología |
|---|---|
| Front-end | [Astro](https://astro.build) 5 |
| Estilos | Tailwind CSS 4 |
| CMS | [Sanity.io](https://www.sanity.io) |
| Hosting + builds + forms + functions | [Netlify](https://www.netlify.com) |
| Boletín por correo | [Brevo](https://www.brevo.com) |
| Donaciones | Enlace de pago Kushki + código QR |

## Requisitos

- Node.js 20+
- Una cuenta de Sanity (para el panel de contenido)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # y rellenar los valores

# 3. Levantar el sitio en desarrollo
npm run dev            # http://localhost:4321

# 4. (Opcional) Levantar el panel de contenido de Sanity
npm run studio         # http://localhost:3333
```

### Crear el proyecto de Sanity

```bash
npx sanity login
npx sanity init --env   # crea el proyecto y escribe PUBLIC_SANITY_PROJECT_ID en .env
```

Luego copia el `projectId` a `.env` (`PUBLIC_SANITY_PROJECT_ID`).

## Estructura del proyecto

```
funadelan-web/
├── astro.config.mjs          # Config de Astro (Sanity + Netlify + Tailwind)
├── sanity.config.ts          # Config del Sanity Studio (panel admin)
├── netlify.toml              # Config de build y functions de Netlify
├── public/                   # Estáticos (favicon, imágenes)
├── netlify/functions/        # Funciones serverless (webhook del boletín)
├── sanity/schemaTypes/       # Esquemas de contenido de Sanity
└── src/
    ├── components/           # Header, Footer, Breadcrumbs, Placeholder…
    ├── config/navigation.ts  # Sitemap (fuente única de navegación)
    ├── layouts/              # BaseLayout, PageLayout
    ├── lib/sanity.ts         # Helpers de consulta a Sanity
    ├── pages/                # Páginas del sitio (según sitemap)
    └── styles/global.css     # Sistema de diseño (tokens, tipografía)
```

## Esquemas de contenido (Sanity)

`paginaEstatica`, `noticia`, `reflexion`, `evento`, `proyecto`, `testimonio`,
`miembroOrganigrama`, `alianza`, `galeriaItem`, `informe`.

## Boletín automático

Al publicar contenido, un webhook de Sanity llama a
`netlify/functions/boletin-webhook.mjs`, que crea una campaña en Brevo y la envía
a los suscriptores. Configurar en Netlify: `SANITY_WEBHOOK_SECRET`, `BREVO_API_KEY`,
`BREVO_LIST_ID`, `BREVO_SENDER_EMAIL` y `PUBLIC_SITE_URL` (los correos necesitan
direcciones absolutas para el logo y los enlaces).

Cada tipo de documento tiene su propio correo: `noticia`, `post`, `reflexion`,
`evento` e `informe`. Los eventos además eligen plantilla desde Sanity (campo
«Plantilla del boletín»): la estándar o la de Chocolate para el Alma, que por ser
el evento anual de recaudación lleva su propia invitación. Los tipos sin página
propia (oraciones, testimonios) no disparan boletín.

Ningún correo lleva la foto del contenido: la única imagen es el logo de la
cabecera, y por eso `PUBLIC_SITE_URL` tiene que apuntar a un dominio que
responda de verdad; si no, los correos salen sin logo y con los enlaces muertos. Para revisar los cinco diseños en el navegador, sin tocar
Brevo ni enviar nada:

```bash
node scripts/previsualizar-boletin.mjs   # deja los HTML en tmp/boletin/
```

### Webhook en Sanity

En [sanity.io/manage](https://www.sanity.io/manage) → API → Webhooks:

- **URL**: `https://<dominio>/.netlify/functions/boletin-webhook`
- **Dataset**: `production`
- **Trigger on**: solo `Create` (con `Update` se reenviaría el boletín en cada
  corrección posterior)
- **Filter**: `_type in ["noticia","post","reflexion","evento","informe"] && !(_id in path("drafts.**"))`
- **Secret**: el mismo valor que `SANITY_WEBHOOK_SECRET` en Netlify
- **Projection**: la de la cabecera de `boletin-webhook.mjs`. Es obligatoria:
  normaliza los campos de los distintos tipos y resuelve las referencias de
  imagen y de PDF, que sin `->` llegarían como `_ref` y no servirían en el correo.

## Pendientes / próximos pasos

- [ ] Conectar las páginas a Sanity (reemplazar datos de ejemplo en `index.astro`).
- [ ] Página de detalle de noticia (`/noticias/[slug]`).
- [ ] Formulario de suscripción al boletín → Brevo.
- [ ] Crear la cuenta de FUNADELÁN en Kushki y configurar `PUBLIC_KUSHKI_PAYMENT_URL`.
- [ ] Subir el QR de donación a `public/` y configurar `PUBLIC_DONATION_QR_URL`.
- [ ] Resolver los 13 huecos de requisitos (ver documento de contexto, sección 4).

## Accesibilidad

Diseño optimizado para legibilidad de adultos mayores (RNF-12): base 18px,
alto contraste, áreas de toque amplias, foco visible y respeto a
`prefers-reduced-motion`.
