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
