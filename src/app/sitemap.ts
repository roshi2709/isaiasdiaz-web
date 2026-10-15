import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
// Durante la etapa de construcción, no anunciar rutas de idiomas sin verificar.
// Las páginas de vista previa usan noindex y no deben estar en el sitemap público.
export default function sitemap(): MetadataRoute.Sitemap {
 return [];
}
