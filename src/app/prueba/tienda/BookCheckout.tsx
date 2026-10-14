'use client';
import { useEffect, useState } from 'react';
type PayPalSDK = { Buttons: (options: { createOrder: () => Promise<string>; onApprove: (data: { orderID: string }) => Promise<void>; onError: () => void }) => { render: (element: HTMLElement) => Promise<void> } };
declare global { interface Window { paypal?: PayPalSDK } }
const worker = 'https://isaiasdiaz-books-payments.isaiasdiaz.workers.dev';
const products = [{ id: 'finanzas', title: 'Finanzas personales para principiantes', price: '$2.99' }, { id: 'ahorro', title: 'Cómo ahorrar dinero aunque ganes poco', price: '$2.99' }, { id: 'paquete', title: 'Paquete de ambos libros', price: '$4.99' }];
export default function BookCheckout() {
 const [selected, setSelected] = useState('paquete');
 const [receiptEmail, setReceiptEmail] = useState('');
 const [error, setError] = useState('');
 const [downloads, setDownloads] = useState<{filename:string;url:string}[]>([]);
 const [ready, setReady] = useState(false);
 const [processing, setProcessing] = useState(false);
 const [clientId, setClientId] = useState('');
 const [environment, setEnvironment] = useState<'live' | 'sandbox' | ''>('');
 const configured = Boolean(clientId);
 useEffect(() => {
  const requested = new URLSearchParams(window.location.search).get('producto');
  if (requested && products.some(p => p.id === requested)) setSelected(requested);
 }, []);
 useEffect(() => {
  let active = true;
  fetch(worker + '/config').then(async res => { if (!res.ok) throw new Error('Servicio de pagos no disponible'); return res.json(); }).then(data => { if (active && (data.environment === 'sandbox' || data.environment === 'live') && data.clientId) { setClientId(data.clientId); setEnvironment(data.environment); } }).catch(() => { if (active) setError('No se pudo cargar la configuración de PayPal.'); });
  return () => { active = false; };
 }, []);
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
    if (environment === 'sandbox' && receiptEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail.trim())) throw new Error('Introduce un correo válido.');
    const res = await fetch(worker + '/create-order', { method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({product:selected,email:receiptEmail.trim()}) });
    const data = await res.json();
    if (!res.ok || !data.id) throw new Error('No se pudo crear la orden.');
    return data.id;
   },
   onApprove: async ({orderID}) => {
    setProcessing(true);
    try {
     const res = await fetch(worker + '/capture-order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderID})});
     const data = await res.json();
     if (!res.ok || data.status !== 'COMPLETED') throw new Error('No se confirmó el pago. Contacta con soporte si se realizó un cargo.');
     if (active) setDownloads(data.downloads || []);
    } catch(e) {if(active)setError((e instanceof Error?e.message:'Error al confirmar el pago') + ' Si se efectuó el cargo, no vuelvas a pagar; escribe a contacto@isaiasdiaz.com con el identificador de la transacción.');}
    finally {if(active)setProcessing(false);}
   },
   onError: () => { if(active)setError('No se pudo completar el pago. Inténtalo nuevamente.'); }
  }).render(container).catch(() => {if(active)setError('No se pudieron mostrar los botones de PayPal.');});
  return () => { active = false; container.innerHTML = ''; };
 }, [ready, selected, receiptEmail, environment]);
 return <section style={{padding:'24px',border:'1px solid #d8e4f2',borderRadius:18,margin:'32px 0',background:'#fff',color:'#143456'}}>
  <h2 style={{marginTop:0}}>Compra digital segura</h2>
  <p>Selecciona un libro o el paquete. Los enlaces de descarga se habilitan después de verificar el pago.</p>
  <div style={{display:'grid',gap:10,marginBottom:20}}>{products.map(p=><label key={p.id} style={{display:'flex',gap:10,alignItems:'center',padding:12,border:'1px solid #d8e4f2',borderRadius:10}}><input type="radio" name="book-product" checked={selected===p.id} onChange={()=>{setSelected(p.id);setDownloads([]);setError('');}}/><span style={{flex:1}}>{p.title}</span><strong>{p.price}</strong></label>)}</div>
  {environment === 'sandbox' && <label style={{display:'grid',gap:8,marginBottom:20}}><strong>Correo de prueba (opcional)</strong><input type="email" autoComplete="email" value={receiptEmail} onChange={e=>setReceiptEmail(e.target.value)} placeholder="tu@correo.com" style={{padding:12,border:'1px solid #d8e4f2',borderRadius:10,fontSize:16}}/><small>Solo en Sandbox. En pagos reales se usa el correo asociado al pago de PayPal.</small></label>}
  {!configured ? <p role="status"><strong>Pagos temporalmente no disponibles.</strong> No se ha podido cargar PayPal.</p> : <><p><strong>{environment === 'live' ? 'Pago seguro con PayPal' : 'Modo de pruebas Sandbox'}:</strong> {environment === 'live' ? 'Paga de forma segura con PayPal o tarjeta, según disponibilidad. Tras confirmar tu compra, podrás descargar tus libros y recibirás un correo con los enlaces de descarga en la dirección facilitada por PayPal.' : 'No se cobrará dinero real.'}</p><div id="books-paypal-buttons" />{!ready && <p>Cargando PayPal…</p>}</>}
  {processing && <p role="status">Verificando tu pago y preparando los enlaces de descarga. No cierres esta página ni repitas el pago.</p>}
  {error && <p role="alert" style={{color:'#b42318'}}>{error}</p>}
  <p style={{fontSize:13}}>¿Problemas con el pago o la descarga? Escríbenos a <a href="mailto:contacto@isaiasdiaz.com">contacto@isaiasdiaz.com</a>. Si PayPal ya te cobró, no repitas el pago.</p>
  {downloads.length>0 && <div role="status"><h3>¡Pago confirmado!</h3><p>Descarga tus libros. Estos enlaces vencen en 24 horas.</p>{downloads.map(d=><p key={d.url}><a href={d.url} target="_blank" rel="noopener noreferrer">Descargar {d.filename} ↗</a></p>)}</div>}
 </section>;
}
