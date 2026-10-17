import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function sitemap():MetadataRoute.Sitemap{
 const base='https://isaiasdiaz.com';
 const routes=['/','/desarrollo-web/','/proyectos/','/tienda/','/acerca-de-mi/','/contacto/','/politica-de-privacidad/','/politica-de-cookies/','/terminos-y-condiciones/','/aviso-legal/'];
 return routes.map(path=>({url:base+path,changeFrequency:path==='/'?'weekly':'monthly',priority:path==='/'?1:0.6}));
}
