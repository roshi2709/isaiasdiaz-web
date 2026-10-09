import type { Metadata } from 'next';
import Link from 'next/link';

const catalog={
 'finanzas-personales-para-principiantes':{
 title:'Finanzas personales para principiantes',
 subtitle:'Guía práctica para aprender a manejar tu dinero de forma simple, clara y efectiva',
 cover:'/portada-finanzas-personales.png',
 amazon:'https://www.amazon.com/dp/B0H4CV13VV',
 intro:'Finanzas Personales para Principiantes es una guía práctica diseñada para ayudarte a ordenar tu dinero, crear un presupuesto simple, ahorrar aunque empieces con poco y evitar errores financieros comunes.',
 topics:['Entender tus ingresos y gastos','Hacer un presupuesto fácil de seguir','Crear el hábito del ahorro','Salir del desorden financiero','Evitar deudas peligrosas','Construir estabilidad financiera paso a paso'],
 conclusion:'Si sientes que tu dinero desaparece rápido, que no sabes en qué se va o que necesitas empezar desde cero, esta guía te ayudará a tomar el control de tus finanzas de manera clara, sencilla y práctica.',
 audience:'Ideal para principiantes que quieren mejorar su relación con el dinero y comenzar a construir un futuro financiero más ordenado.'
 },
 'como-ahorrar-dinero-aunque-ganes-poco':{
 title:'Cómo ahorrar dinero aunque ganes poco',
 subtitle:'Un método práctico para organizar tus ingresos, reducir gastos y construir ahorros desde cero',
 cover:'/portada-como-ahorrar.png',
 amazon:'https://a.co/d/0fMt73Ae',
 intro:'¿Sientes que ahorrar es imposible porque ganas poco o porque el dinero desaparece antes de terminar el mes? Este libro es una guía práctica para organizar mejor tus ingresos, reducir gastos innecesarios y comenzar a construir ahorros desde cero, sin fórmulas complicadas ni promesas irreales. Está pensado para personas que buscan estrategias sencillas, realistas y fáciles de aplicar.',
 topics:['Identificar en qué se va realmente tu dinero','Crear un presupuesto adaptado a tus ingresos','Reducir gastos sin sentir que dejas de vivir','Controlar las compras impulsivas','Ahorrar en supermercado, transporte y servicios','Organizar tus deudas','Construir un fondo de emergencia','Ahorrar aunque tus ingresos sean variables','Aprovechar bonos e ingresos extraordinarios','Aumentar tu capacidad de ahorro','Crear metas financieras realistas','Desarrollar hábitos sostenibles a largo plazo'],
 extras:'Incluye retos de ahorro, ejemplos sencillos, ejercicios prácticos, un plan financiero de 12 meses y recursos digitales que puedes utilizar desde tu teléfono, computadora o aplicación de notas.',
 conclusion:'No necesitas ganar mucho para comenzar. Puedes empezar con lo que tienes hoy, aunque tu primer ahorro sea de $5, $10 o $20.',
 audience:'Si quieres dejar de sentir que el dinero se te escapa de las manos y avanzar hacia una mayor tranquilidad económica, este libro puede ser tu punto de partida.'
 }
} as const;
type Slug=keyof typeof catalog;
const langs=['es','en','pt'] as const;
const ui={
 es:{back:'Volver a todos los libros',series:'Colección Dinero Inteligente',learn:'En este libro aprenderás a',extras:'Recursos y herramientas',amazon:'Ver libro en Amazon',shop:'Ver tienda de libros PDF',note:'La venta directa de PDF está en preparación. Puedes consultar la edición disponible en Amazon.',language:'Libro en español',author:'Autor: Isaías Díaz'},
 en:{back:'Back to all books',series:'Dinero Inteligente Collection',learn:'What you will learn',extras:'Resources and tools',amazon:'View on Amazon',shop:'Explore PDF bookstore',note:'Direct PDF sales are being prepared. The available edition can be viewed on Amazon.',language:'Book written in Spanish',author:'Author: Isaías Díaz'},
 pt:{back:'Voltar aos livros',series:'Coleção Dinero Inteligente',learn:'O que você vai aprender',extras:'Recursos e ferramentas',amazon:'Ver na Amazon',shop:'Conhecer a loja de PDFs',note:'A venda direta de PDFs está em preparação. A edição disponível pode ser consultada na Amazon.',language:'Livro em espanhol',author:'Autor: Isaías Díaz'}
} as const;
export function generateStaticParams(){return langs.flatMap(lang=>(Object.keys(catalog) as Slug[]).map(slug=>({lang,slug})));}
export async function generateMetadata({params}:{params:Promise<{lang:string;slug:string}>}):Promise<Metadata>{
 const {lang,slug}=await params;const book=catalog[slug as Slug];if(!book)return {title:'Libro no encontrado'};
 const root='https://isaiasdiaz.com';return {title:`${book.title} | Isaías Díaz`,description:book.subtitle,alternates:{canonical:`${root}/${lang}/libros/${slug}/`,languages:{es:`${root}/es/libros/${slug}/`,en:`${root}/en/libros/${slug}/`,pt:`${root}/pt/libros/${slug}/`}},openGraph:{title:book.title,description:book.subtitle,images:[book.cover]}};
}
export default async function BookDetail({params}:{params:Promise<{lang:string;slug:string}>}){
 const {lang,slug}=await params;const locale=lang==='en'||lang==='pt'?lang:'es';const book=catalog[slug as Slug];const t=ui[locale];
 if(!book)return <main className="wrap section"><h1>Libro no encontrado</h1><Link href={`/${locale}/libros/`}>{t.back}</Link></main>;
 return <><header className="top wrap"><Link className="brand" href={`/${locale}/`}>Isaías Díaz</Link><nav className="nav"><Link href={`/${locale}/libros/`}>{t.back}</Link></nav></header>
 <main className="wrap"><section className="section book-detail"><Link className="book-detail-back" href={`/${locale}/libros/`}>← {t.back}</Link><div className="book-detail-grid"><div className="book-detail-art"><img src={book.cover} alt={`Portada de ${book.title}`}/></div><div className="book-detail-content"><div className="eyebrow">{t.series}</div><h1>{book.title}</h1><p className="book-detail-subtitle">{book.subtitle}</p><p className="books-author">{t.author} · {t.language}</p><p>{book.intro}</p><h2>{t.learn}</h2><ul>{book.topics.map(topic=><li key={topic}>{topic}</li>)}</ul>{'extras' in book&&<><h2>{t.extras}</h2><p>{book.extras}</p></>}<p>{book.conclusion}</p><p>{book.audience}</p><div className="books-actions"><a className="btn primary" href={book.amazon} target="_blank" rel="noopener noreferrer" style={{color:'white'}}>{t.amazon} ↗</a><Link className="books-shop-link" href="/prueba/tienda/">{t.shop} ↗</Link></div><p className="books-note">{t.note}</p></div></div></section></main><footer className="footer"><div className="wrap">© {new Date().getFullYear()} Isaías Díaz</div></footer></>;
}
