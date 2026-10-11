'use client';
import { useEffect, useState } from 'react';
type PayPalActions = { order: { create: (args: { purchase_units?: unknown[] }) => Promise<string> } };
type PayPalSDK = { Buttons: (options: { createOrder: () => Promise<string>; onApprove: (data: { orderID: string }) => Promise<void>; onError: () => void }) => { render: (element: HTMLElement) => Promise<void> } };
declare global { interface Window { paypal?: PayPalSDK } }
const worker = process.env.NEXT_PUBLIC_BOOKS_WORKER_URL?.replace(/\/$/, '') || '';
const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || '';
const products = [{ id: 'finanzas', title: 'Finanzas personales para principiantes', price: '$2.99' }, { id: 'ahorro', title: 'Cómo ahorrar dinero aunque ganes poco', price: '$2.99' }, { id: 'paquete', title: 'Paquete de ambos libros', price: '$4.99' }];
export default function BookCheckout() {
 const [selected, setSelected] = useState('paquete');
 const [error, setError] = useState('');
 const [downloads, setDownloads] = useState<{filename:string;url:string}[]>([]);
 const [ready, setReady] = useState(false);
 const configured = Boolean(worker && clientId);
 useEffect(() => {
  if (!configured) return;
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(clientId) + '&currency=USD&intent=capture';
  script.async = true;
  script.onload = () => setReady(true);
  script.onerror = () => setError('No se pudo cargar PayPal.');
  document.body.appendChild(script);
  return () => { script.remove(); setReady(false); };
 }, [configured]);
 useEffect(() => {
  if (!ready || !window.paypal) return;
  const container = document.getElementById('books-paypal-buttons');
  if (!container) return;
  container.innerHTML = '';
  let active = true;
  window.paypal.Buttons({
   createOrder: async () => {
    setError('');setDownloads([]);
    const res = await fetch(worker + '/create-order', { method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({product:selected}) });
    const data = await res.json();
    if (!res.ok || !data.id) throw new Error('No se pudo crear la orden.');
    return data.id;
   },
   onApprove: async ({orderID}) => {
    try {
     const res = await fetch(worker + '/capture-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderID})});
     const data = await res.json();
     if (!res.ok || data.status !== 'COMPLETED') throw new Error('No se confirmó el pago. Contacta con soporte si se realizó un cargo.');
     if (active) setDownloads(data.downloads || []);
    } catch(e) {if(active)setError(e instanceof Error?e.message:'Error al confirmar el pago');}
   },
   onError: () => { if(active)setError('No se pudo completar el pago. Inténtalo nuevamente.'); }
  }).render(container).catch(() => {if(active)setError('No se pudieron mostrar los botones de PayPal.');});
  return () => { active = false; container.innerHTML = ''; };
 }, [ready, selected]);
 return <section style={{padding:'24px',border:'1px solid #d8e4f2',borderRadius:18,margin:'32px 0',background:'#fff',color:'#143456'}}>
  <h2 style={{marginTop:0}}>Compra digital segura</h2>
  <p>Selecciona un libro o el paquete. Los enlaces de descarga se habilitan después de verificar el pago.</p>
  <div style={{display:'grid',gap:10,marginBottom:20}}>{products.map(p=><label key={p.id} style={{display:'flex',gap:10,alignItems:'center',padding:12,border:'1px solid #d8e4f2',borderRadius:10}}><input type="radio" name="book-product" checked={selected===p.id} onChange={()=>{setSelected(p.id);setDownloads([]);setError('');}}/><span style={{flex:1}}>{p.title}</span><strong>{p.price}</strong></label>)}</div>
  {!configured ? <p role="status"><strong>Pagos en preparación.</strong> Estamos configurando PayPal y la entrega privada de los PDF. Todavía no se realizarán cargos.</p> : <><p><strong>Modo de pruebas Sandbox:</strong> no se cobrará dinero real.</p><div id="books-paypal-buttons" />{!ready && <p>Cargando PayPal…</p>}</>}
  {error && <p role="alert" style={{color:'#b42318'}}>{error}</p>}
  {downloads.length>0 && <div role="status"><h3>¡Pago confirmado!</h3><p>Descarga tus libros. Estos enlaces vencen en 24 horas.</p>{downloads.map(d=><p key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer">Descargar {d.filename} ↗</a></p>)}</div>}
 </section>;
}
