# FUNADELÁN — Sitio web

Sitio web de la **Fundación Amigos de los Ángeles** (FUNADELÁN), Portoviejo, Manabí, Ecuador.

Sitio informativo (no transaccional, salvo donaciones) con panel de contenido para
un administrador no técnico. Pensado para presentarse en el evento **"Chocolate para
el Alma"** (15 de noviembre).

## Stack (Jamstack)

| Capa | Tecnología |
|---|---|
| Front-end | [Astro](https://astro.build) 5 |
| Estilos | Tailwind CSS 4 |
| CMS | [Sanity.io](https://www.sanity.io) |
| Hosting + builds + forms + functions | [Netlify](https://www.netlify.com) |
| Boletín por correo | [Brevo](https://www.brevo.com) |
| Donaciones | Stripe + PayPal |

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

Al publicar una noticia, un webhook de Sanity llama a
`netlify/functions/boletin-webhook.mjs`, que crea una campaña en Brevo y la envía
a los suscriptores. Configurar en Netlify: `SANITY_WEBHOOK_SECRET`, `BREVO_API_KEY`,
`BREVO_LIST_ID`.

## Pendientes / próximos pasos

- [ ] Conectar las páginas a Sanity (reemplazar datos de ejemplo en `index.astro`).
- [ ] Página de detalle de noticia (`/noticias/[slug]`).
- [ ] Formulario de suscripción al boletín → Brevo.
- [ ] Integrar Stripe Checkout y botón de PayPal en `/colabora/donar`.
- [ ] Resolver los 13 huecos de requisitos (ver documento de contexto, sección 4).

## Accesibilidad

Diseño optimizado para legibilidad de adultos mayores (RNF-12): base 18px,
alto contraste, áreas de toque amplias, foco visible y respeto a
`prefers-reduced-motion`.
