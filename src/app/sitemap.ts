import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
 const languages={'es':'https://isaiasdiaz.com/es/','en':'https://isaiasdiaz.com/en/','pt':'https://isaiasdiaz.com/pt/','x-default':'https://isaiasdiaz.com/'};
 return [{url:'https://isaiasdiaz.com/',changeFrequency:'monthly',priority:0.7},...(['es','en','pt'] as const).map(lang=>({url:languages[lang],changeFrequency:'monthly' as const,priority:1,alternates:{languages}})),...(['es','en','pt'] as const).map(lang=>({url:`https://isaiasdiaz.com/${lang}/libros/`,changeFrequency:'monthly' as const,priority:0.8,alternates:{languages:{es:'https://isaiasdiaz.com/es/libros/',en:'https://isaiasdiaz.com/en/libros/',pt:'https://isaiasdiaz.com/pt/libros/'}}}))];
}
