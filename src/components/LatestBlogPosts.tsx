'use client';
import { useEffect, useState } from 'react';

type Article = { title: string; url: string; image: string; excerpt: string; date: string };
type BloggerEntry = { title?: {$t:string}; link?: {rel:string;href:string}[]; content?: {$t:string}; summary?: {$t:string}; published?: {$t:string}; media$thumbnail?: {url:string} };
type BloggerFeed = { feed?: {entry?: BloggerEntry[]} };
const BLOG = 'https://blog.isaiasdiaz.com';
const stripHtml = (html:string) => html.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function thumbnail(entry:BloggerEntry) {
  if (entry.media$thumbnail?.url) return entry.media$thumbnail.url.replace(/\/s\d+(-c)?\//, '/w800-h450-p-k-no/');
  const html=entry.content?.$t||'';
  const match=html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || '';
}
export default function LatestBlogPosts(){
  const [posts,setPosts]=useState<Article[]>([]);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>{
    const callback='isaiasLatestBlogFeed';
    const globalWindow=window as typeof window & {isaiasLatestBlogFeed?: (feed:BloggerFeed)=>void};
    const script=document.createElement('script');
    let timer:ReturnType<typeof setTimeout>;
    globalWindow[callback]=(data:BloggerFeed)=>{
      clearTimeout(timer);
      const articles=(data.feed?.entry||[]).slice(0,3).map(entry=>({
        title:entry.title?.$t||'Artículo del blog',
        url:entry.link?.find(link=>link.rel==='alternate')?.href||BLOG,
        image:thumbnail(entry),
        excerpt:stripHtml(entry.summary?.$t||entry.content?.$t||'').slice(0,145),
        date:entry.published?.$t||''
      }));
      setPosts(articles);
      setStatus(articles.length?'ready':'error');
    };
    script.src=BLOG+'/feeds/posts/default?alt=json-in-script&max-results=3&callback='+callback;
    script.async=true;
    script.onerror=()=>{clearTimeout(timer);setStatus('error')};
    document.body.appendChild(script);
    timer=setTimeout(()=>setStatus(s=>s==='loading'?'error':s),10000);
    return ()=>{clearTimeout(timer);script.remove();delete globalWindow[callback]};
  },[]);
  return <section id="blog" className="studio-section studio-blog-section" aria-labelledby="studio-blog-heading">
    <div className="studio-container">
      <div className="studio-section-heading">
        <div><div className="studio-section-kicker">03 / IDEAS Y CONOCIMIENTO</div><h2 id="studio-blog-heading">Lo más nuevo <em>en mi blog.</em></h2></div>
        <p>Artículos recientes sobre tecnología, finanzas personales y emprendimiento.</p>
      </div>
      {status==='loading'&&<p className="studio-blog-message" role="status">Cargando artículos recientes…</p>}
      {status==='error'&&<p className="studio-blog-message">Visita mi blog para descubrir las últimas publicaciones. <a href={BLOG}>Ir al blog ↗</a></p>}
      {status==='ready'&&<div className="studio-blog-grid">{posts.map(post=><a className="studio-blog-card" key={post.url} href={post.url} target="_blank" rel="noopener noreferrer">
        <div className="studio-blog-art">{post.image?<img src={post.image} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<span aria-hidden="true">✦</span>}</div>
        <div className="studio-blog-body"><small>ARTÍCULO RECIENTE</small><h3>{post.title}</h3><p>{post.excerpt}{post.excerpt.length>=145?'…':''}</p><strong>Leer artículo ↗</strong></div>
      </a>)}</div>}
      <div className="studio-blog-all"><a className="studio-button studio-button-primary" href={BLOG} target="_blank" rel="noopener noreferrer">Ver todos los artículos ↗</a></div>
    </div>
  </section>
}