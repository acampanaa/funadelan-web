// Prefijos telefónicos para los formularios del sitio.
//
// Es una lista corta a propósito: Ecuador primero y después los países desde
// donde escribe la gente que sigue a la fundación (migración manabita y
// aliados). Un desplegable con los ~200 códigos del mundo obliga a buscar y no
// aporta nada aquí. Para añadir uno, basta con ponerlo en su sitio.
//
// Sin banderas: Windows no trae los glifos y en vez del emoji se ven dos
// letras sueltas.

export interface Prefijo {
  pais: string;
  codigo: string;
}

export const prefijos: Prefijo[] = [
  { pais: 'Ecuador', codigo: '+593' },
  { pais: 'Colombia', codigo: '+57' },
  { pais: 'Perú', codigo: '+51' },
  { pais: 'Venezuela', codigo: '+58' },
  { pais: 'Chile', codigo: '+56' },
  { pais: 'Argentina', codigo: '+54' },
  { pais: 'Bolivia', codigo: '+591' },
  { pais: 'Brasil', codigo: '+55' },
  { pais: 'Uruguay', codigo: '+598' },
  { pais: 'Paraguay', codigo: '+595' },
  { pais: 'México', codigo: '+52' },
  { pais: 'Panamá', codigo: '+507' },
  { pais: 'Costa Rica', codigo: '+506' },
  { pais: 'Estados Unidos / Canadá', codigo: '+1' },
  { pais: 'España', codigo: '+34' },
  { pais: 'Italia', codigo: '+39' },
];

/** El que viene marcado por defecto. */
export const prefijoPorDefecto = '+593';
