// Helpers de consulta a Sanity para usar dentro de páginas Astro.
// El cliente base lo provee la integración @sanity/astro vía `sanity:client`.
import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export { sanityClient };

const builder = imageUrlBuilder(sanityClient);

/** Construye una URL de imagen optimizada desde una referencia de Sanity. */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

/** Formatea una fecha ISO de Sanity al estilo local (es-EC). */
export function formatearFecha(
  fecha?: string,
  opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
) {
  if (!fecha) return '';
  return new Intl.DateTimeFormat('es-EC', opciones).format(new Date(fecha));
}

/** Últimas N noticias para la sección de Inicio. */
export async function getUltimasNoticias(limite = 3) {
  return sanityClient.fetch(
    `*[_type == "noticia"] | order(fecha desc)[0...$limite]{
      _id, titulo, "slug": slug.current, fecha, resumen, imagen
    }`,
    { limite },
  );
}

/** Todas las noticias para el listado. */
export async function getNoticias() {
  return sanityClient.fetch(
    `*[_type == "noticia"] | order(fecha desc){
      _id, titulo, "slug": slug.current, fecha, resumen, imagen
    }`,
  );
}

/** Contenido editable de una página informativa, por su clave única. */
export async function getPaginaEstatica(clave: string) {
  return sanityClient.fetch(
    `*[_type == "paginaEstatica" && clave == $clave][0]{
      titulo, clave, lead, imagen, cuerpo
    }`,
    { clave },
  );
}

/** Cargos del organigrama, ordenados por jerarquía (nivel 1 = más alto). */
export async function getOrganigrama() {
  return sanityClient.fetch(
    `*[_type == "miembroOrganigrama"] | order(nivel asc, orden asc){
      _id, cargo, area, nivel, orden,
      "reportaA": reportaA->cargo
    }`,
  );
}

/** Una noticia por slug (para la página de detalle). */
export async function getNoticia(slug: string) {
  return sanityClient.fetch(
    `*[_type == "noticia" && slug.current == $slug][0]{
      _id, titulo, fecha, resumen, imagen, cuerpo
    }`,
    { slug },
  );
}

/** Reflexiones / mensajes, de la más reciente a la más antigua. */
export async function getReflexiones() {
  return sanityClient.fetch(
    `*[_type == "reflexion"] | order(fecha desc){
      _id, titulo, "slug": slug.current, fecha, autor
    }`,
  );
}

/** Una reflexión por slug (para la página de detalle). */
export async function getReflexion(slug: string) {
  return sanityClient.fetch(
    `*[_type == "reflexion" && slug.current == $slug][0]{
      _id, titulo, fecha, autor, cuerpo
    }`,
    { slug },
  );
}

/** Eventos ordenados por fecha de inicio. Filtra por tipo ("social" | "espiritual") si se indica. */
export async function getEventos(tipo?: string) {
  return sanityClient.fetch(
    `*[_type == "evento" ${tipo ? '&& tipo == $tipo' : ''}] | order(fechaInicio asc){
      _id, titulo, "slug": slug.current, fechaInicio, fechaFin, lugar, tipo, resumen, imagen, destacado
    }`,
    tipo ? { tipo } : {},
  );
}

/** Testimonios. */
export async function getTestimonios() {
  return sanityClient.fetch(
    `*[_type == "testimonio"]{
      _id, autor, rol, tipo, cita, foto
    }`,
  );
}

/** Alianzas / aliados, ordenados por el campo "orden". */
export async function getAlianzas() {
  return sanityClient.fetch(
    `*[_type == "alianza"] | order(orden asc, nombre asc){
      _id, nombre, logo, sitioWeb, descripcion
    }`,
  );
}

/** Elementos de la galería (fotos y videos), del más reciente al más antiguo. */
export async function getGaleria() {
  return sanityClient.fetch(
    `*[_type == "galeriaItem"] | order(fecha desc){
      _id, titulo, tipo, imagen, videoUrl, fecha
    }`,
  );
}

/** Informes de rendición de cuentas, con URL de descarga del PDF. */
export async function getInformes() {
  return sanityClient.fetch(
    `*[_type == "informe"] | order(anio desc){
      _id, titulo, anio, descripcion, "archivoUrl": archivo.asset->url
    }`,
  );
}

/** Proyectos / programas. Filtra por categoría si se indica. */
export async function getProyectos(categoria?: string) {
  return sanityClient.fetch(
    `*[_type == "proyecto" ${categoria ? '&& categoria == $categoria' : ''}] | order(orden asc, nombre asc){
      _id, nombre, "slug": slug.current, categoria, resumen, imagen, destacado
    }`,
    categoria ? { categoria } : {},
  );
}
