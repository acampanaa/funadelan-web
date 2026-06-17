import { noticia } from './noticia';
import { proyecto } from './proyecto';
import { testimonio } from './testimonio';
import { miembroOrganigrama } from './miembroOrganigrama';
import { alianza } from './alianza';
import { evento } from './evento';
import { reflexion } from './reflexion';
import { informe } from './informe';
import { galeriaItem } from './galeriaItem';
import { paginaEstatica } from './paginaEstatica';

export const schemaTypes = [
  // Páginas e informativos
  paginaEstatica,
  // Contenido recurrente
  noticia,
  reflexion,
  evento,
  // Programas y organización
  proyecto,
  testimonio,
  miembroOrganigrama,
  alianza,
  // Multimedia y transparencia
  galeriaItem,
  informe,
];
