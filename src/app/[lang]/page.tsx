import Link from 'next/link';
import type { Metadata } from 'next';
const content={
es:{title:'Estamos construyendo algo nuevo.',copy:'Transformamos ideas en soluciones digitales. Muy pronto encontrarás nuestros servicios, proyectos tecnológicos y publicaciones.',contact:'Contáctanos',tag:'TECNOLOGÍA · INNOVACIÓN · CREATIVIDAD'},
en:{title:'Something new is coming.',copy:'We turn ideas into digital solutions. Our services, technology projects and books will be available here soon.',contact:'Contact us',tag:'TECHNOLOGY · INNOVATION · CREATIVITY'},
pt:{title:'Estamos construindo algo novo.',copy:'Transformamos ideias em soluções digitais. Em breve, nossos serviços, projetos de tecnologia e livros estarão disponíveis aqui.',contact:'Entre em contato',tag:'TECNOLOGIA · INOVAÇÃO · CRIATIVIDADE'}
} as const;
type Lang=keyof typeof content;
export function generateStaticParams(){return [{lang:'es'},{lang:'en'},{lang:'pt'}]}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{const {lang}=await params;const l:Lang=lang==='en'||lang==='pt'?lang:'es';return {title:content[l].title,description:content[l].copy,robots:{index:false,follow:false}}}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;const locale:Lang=lang==='en'||lang==='pt'?lang:'es';const t=content[locale];return <main className="maintenance"><div className="maintenance-panel"><img className="maintenance-logo" src="/logo-isaias-diaz.svg" alt="Isaías Díaz — Soluciones Digitales" width="300" height="113"/><p className="maintenance-eyebrow">{t.tag}</p><h1>{t.title}</h1><p className="maintenance-copy">{t.copy}</p><a className="maintenance-button" href="mailto:contacto@isaiasdiaz.com">{t.contact} ↗</a><div className="maintenance-languages">{(['es','en','pt'] as const).map(l=><Link key={l} href={`/${l}/`} aria-current={locale===l?'page':undefined}>{l.toUpperCase()}</Link>)}</div><p className="maintenance-foot">© {new Date().getFullYear()} Isaías Díaz</p></div></main>}
