const allowedOrigins=new Set(['https://isaiasdiaz.com','https://www.isaiasdiaz.com','https://isaiasdiaz-web.pages.dev']);
function headers(origin){return {'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://isaiasdiaz.com','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}}
function reply(status,body,origin){return new Response(JSON.stringify(body),{status,headers:headers(origin)})}
function safeHeader(value){return String(value).replace(/[\r\n]/g,' ').slice(0,200)}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin')||'';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin)});
 if(request.method!=='POST')return reply(405,{error:'Method not allowed'},origin);
 if(!allowedOrigins.has(origin))return reply(403,{error:'Origin not allowed'},origin);
 if(Number(request.headers.get('Content-Length')||0)>12000)return reply(413,{error:'Request too large'},origin);
 let body;try{body=await request.json()}catch{return reply(400,{error:'Invalid JSON'},origin)}
 const {name,email,service,message,website,turnstileToken}=body||{};
 if(website)return reply(200,{ok:true},origin);
 if(typeof name!=='string'||name.trim().length<2||name.length>100||typeof email!=='string'||email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof service!=='string'||service.length>100||typeof message!=='string'||message.trim().length<10||message.length>4000||typeof turnstileToken!=='string')return reply(400,{error:'Invalid fields'},origin);
 if(!env.TURNSTILE_SECRET_KEY||!env.CONTACT_EMAIL)return reply(503,{error:'Service not configured'},origin);
 const ip=request.headers.get('CF-Connecting-IP')||'';
 const verifyBody=new FormData();verifyBody.append('secret',env.TURNSTILE_SECRET_KEY);verifyBody.append('response',turnstileToken);if(ip)verifyBody.append('remoteip',ip);
 let verification;try{const result=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:verifyBody});verification=await result.json()}catch{return reply(502,{error:'Verification unavailable'},origin)}
 if(!verification.success)return reply(403,{error:'Security verification failed'},origin);
 const from='contacto@isaiasdiaz.com',to='isaiasdiaz@yahoo.com';
 const subject=safeHeader('Consulta web: '+service);
 const text=['Nueva consulta desde isaiasdiaz.com','Nombre: '+name.trim(),'Email: '+email.trim(),'Servicio: '+service.trim(),'','Mensaje:',message.trim()].join('\n');
 try{
  await env.CONTACT_EMAIL.send({from,to,subject,text});
  return reply(200,{ok:true},origin);
 }catch(error){console.error('Email service send failed',error);return reply(502,{error:'Email delivery failed'},origin)}

 }};
