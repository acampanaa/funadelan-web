// Estructura de navegación derivada del sitemap aprobado.
// Fuente única de verdad para Header, Footer y migas de pan.

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
  external?: boolean;
}

export const mainNav: NavLink[] = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Quiénes somos',
    href: '/quienes-somos',
    children: [
      { label: 'La fundación', href: '/quienes-somos/la-fundacion' },
      { label: 'Historia', href: '/quienes-somos/historia' },
      { label: 'Misión / Visión', href: '/quienes-somos/mision-vision' },
      { label: 'Derechos del Adulto Mayor', href: '/quienes-somos/derechos-adulto-mayor' },
      { label: 'Organigrama', href: '/quienes-somos/organigrama' },
      { label: 'Testimonios', href: '/quienes-somos/testimonios' },
      { label: 'Alianzas', href: '/quienes-somos/alianzas' },
    ],
  },
  {
    label: 'Espiritualidad',
    href: '/espiritualidad',
    children: [
      { label: 'Reflexiones y mensajes', href: '/espiritualidad/reflexiones' },
      { label: 'Oraciones', href: '/oraciones' },
      { label: 'Eventos', href: '/espiritualidad/eventos' },
      {
        label: 'Para Ti, Joven',
        href: 'https://fabroparatijoven.wixsite.com/website',
        external: true,
      },
    ],
  },
  {
    label: 'Programas',
    href: '/programas',
    children: [
      { label: 'CAIMHA', href: '/programas/actividades-sociales' },
      { label: 'Novena de los Ángeles', href: '/programas/novena-de-los-angeles' },
      { label: 'Chocolate del Alma', href: '/programas/chocolate-del-alma' },
      { label: 'Bazar de los Ángeles', href: '/programas/bazar-de-los-angeles' },
    ],
  },
  {
    label: 'Noticias',
    href: '/noticias',
    children: [
      { label: 'Publicaciones', href: '/posts' },
      { label: 'Todas las noticias', href: '/noticias' },
      { label: 'Galería', href: '/noticias/galeria' },
      { label: 'Redes sociales', href: '/noticias/redes-sociales' },
    ],
  },
  {
    label: 'Colabora',
    href: '/colabora',
    children: [
      // Donaciones temporalmente deshabilitadas. Volver a activar cuando esté listo.
      // { label: 'Donar', href: '/colabora/donar' },
      { label: 'Rendición de cuentas', href: '/colabora/rendicion-de-cuentas' },
      { label: 'Voluntariado', href: '/colabora/voluntariado' },
      { label: 'Contacto', href: '/colabora/contacto' },
    ],
  },
];
