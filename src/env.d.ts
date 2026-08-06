/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'sanity:client' {
  import type { SanityClient } from '@sanity/client';
  export const sanityClient: SanityClient;
}

/** Lo que expone embed.js de Instagram al cargarse (ver InstagramFeed.astro). */
interface Window {
  instgrm?: {
    Embeds: { process: () => void };
  };
}
