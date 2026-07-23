// Estructura de navegación derivada del sitemap aprobado.
// Fuente única de verdad para Header, Footer y migas de pan.

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
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
    ],
  },
  {
    label: 'Programas',
    href: '/programas',
    children: [
      { label: 'Universidad del Adulto Mayor', href: '/programas/universidad-adulto-mayor' },
      { label: 'Ingeniería (planimetría)', href: '/programas/universidad-adulto-mayor/ingenieria' },
      { label: 'Arquitectura (nueva propuesta)', href: '/programas/universidad-adulto-mayor/arquitectura' },
      { label: 'Red Mundial del Adulto Mayor', href: '/programas/red-mundial' },
      { label: 'Actividades sociales', href: '/programas/actividades-sociales' },
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
      { label: 'Donar', href: '/colabora/donar' },
      { label: 'Rendición de cuentas', href: '/colabora/rendicion-de-cuentas' },
      { label: 'Voluntariado', href: '/colabora/voluntariado' },
      { label: 'Contacto', href: '/colabora/contacto' },
    ],
  },
];
