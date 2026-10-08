import type { MetadataRoute } from 'next';
export default function sitemap():MetadataRoute.Sitemap {return ['','es/','en/','pt/'].map(p=>({url:'https://isaiasdiaz.com/'+p,lastModified:new Date(),changeFrequency:'monthly',priority:p===''?1:0.8}))}
