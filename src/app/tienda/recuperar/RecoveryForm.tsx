'use client';
import { useState, type FormEvent } from 'react';
const endpoint = 'https://isaiasdiaz-books-payments.isaiasdiaz.workers.dev/recover-order';
export default function RecoveryForm() {
 const [orderID,setOrderID]=useState('');
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState(false);
 const [error,setError]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if(busy)return;
  setError('');setDone(false);setBusy(true);
  try {
   const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderID:orderID.trim(),email:email.trim()})});
   if(!res.ok)throw new Error('No se pudo procesar la solicitud.');
   setDone(true);
  } catch {
   setError('No pudimos enviar tu solicitud en este momento. Inténtalo más tarde o escribe a contacto@isaiasdiaz.com.');
  } finally {setBusy(false);}
 }
 return <form onSubmit={submit} style={{marginTop:32,padding:'clamp(20px,4vw,34px)',background:'#fff',border:'1px solid #d8e4f2',borderRadius:18,display:'grid',gap:18}}>
  <h2 style={{fontSize:24,letterSpacing:'normal',margin:0}}>Solicitar nuevos enlaces</h2>
  <label style={{display:'grid',gap:8,fontWeight:700}}>Número de pedido de PayPal
   <input required maxLength={128} autoComplete="off" value={orderID} onChange={e=>setOrderID(e.target.value)} placeholder="Ej.: 1L286449HJ3305324" style={{width:'100%',padding:14,fontSize:16,border:'1px solid #bdcde1',borderRadius:10}}/>
  </label>
  <label style={{display:'grid',gap:8,fontWeight:700}}>Correo asociado a tu compra
   <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={{width:'100%',padding:14,fontSize:16,border:'1px solid #bdcde1',borderRadius:10}}/>
  </label>
  <button type="submit" disabled={busy} style={{padding:'15px 20px',border:0,borderRadius:10,background:'#1259d6',color:'#fff',fontWeight:800,fontSize:16,cursor:busy?'wait':'pointer',opacity:busy?.7:1}}>{busy?'Enviando solicitud…':'Recuperar mis libros →'}</button>
  {done&&<p role="status" style={{margin:0,color:'#165b3a',lineHeight:1.7}}>Si los datos corresponden a una compra completada, enviaremos nuevos enlaces al correo registrado. Revisa también la carpeta de correo no deseado.</p>}
  {error&&<p role="alert" style={{margin:0,color:'#b42318'}}>{error}</p>}
  <small style={{lineHeight:1.6,color:'#536782'}}>Por seguridad, no confirmamos si un pedido o correo existe en nuestros registros. Los enlaces de descarga son temporales.</small>
 </form>;
}
