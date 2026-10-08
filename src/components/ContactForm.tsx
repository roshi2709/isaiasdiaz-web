'use client';
import {useEffect,useRef,useState} from 'react';
type Lang='es'|'en'|'pt';
declare global {interface Window {turnstile?:{render:(element:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;'expired-callback':()=>void})=>string;reset:(id:string)=>void;remove:(id:string)=>void}}}
const translations={
es:{name:'Nombre completo',email:'Correo electrónico',service:'Servicio de interés',message:'Cuéntame sobre tu proyecto',choose:'Selecciona un servicio',services:['Desarrollo web','Aplicaciones digitales','Automatización con IA','Otra consulta'],send:'Enviar mensaje',sending:'Enviando...',success:'Mensaje enviado correctamente. ¡Gracias por escribir!',error:'No se pudo enviar el mensaje. Inténtalo de nuevo o escribe a contacto@isaiasdiaz.com.',verify:'Completa la verificación de seguridad.',setup:'El formulario estará disponible próximamente. Por ahora, puedes escribirnos por correo.'},
en:{name:'Full name',email:'Email address',service:'Service of interest',message:'Tell me about your project',choose:'Choose a service',services:['Web development','Digital applications','AI automation','Other inquiry'],send:'Send message',sending:'Sending...',success:'Your message was sent successfully. Thank you!',error:'Unable to send. Please try again or email contacto@isaiasdiaz.com.',verify:'Complete the security check.',setup:'The form will be available soon. You can contact us by email for now.'},
pt:{name:'Nome completo',email:'Endereço de e-mail',service:'Serviço de interesse',message:'Conte sobre seu projeto',choose:'Escolha um serviço',services:['Desenvolvimento web','Aplicativos digitais','Automação com IA','Outra consulta'],send:'Enviar mensagem',sending:'Enviando...',success:'Mensagem enviada com sucesso. Obrigado!',error:'Não foi possível enviar. Tente novamente ou escreva para contacto@isaiasdiaz.com.',verify:'Conclua a verificação de segurança.',setup:'O formulário estará disponível em breve. Por enquanto, entre em contato por e-mail.'}
} as const;
const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||'';
const endpoint=process.env.NEXT_PUBLIC_CONTACT_API_URL||'';
export default function ContactForm({lang}:{lang:Lang}){
 const t=translations[lang];const target=useRef<HTMLDivElement>(null);const widget=useRef<string|null>(null);
 const [token,setToken]=useState('');const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');const [feedback,setFeedback]=useState('');const [turnstileFailed,setTurnstileFailed]=useState(false);
 useEffect(()=>{if(!siteKey||!target.current)return;let cancelled=false;let interval:ReturnType<typeof setInterval>|undefined;
 const init=()=>{if(cancelled||!target.current||!window.turnstile||widget.current)return;try{widget.current=window.turnstile.render(target.current,{sitekey:siteKey,callback:setToken,'expired-callback':()=>setToken('')});if(interval)clearInterval(interval)}catch(error){console.error('Turnstile initialization failed',error);setTurnstileFailed(true);if(interval)clearInterval(interval)}};
 if(!document.querySelector('script[data-contact-turnstile]')){const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;script.dataset.contactTurnstile='true';script.onload=init;script.onerror=()=>{setTurnstileFailed(true);if(interval)clearInterval(interval)};document.head.appendChild(script)}
 interval=setInterval(init,300);init();
 return()=>{cancelled=true;if(interval)clearInterval(interval);if(widget.current&&window.turnstile){try{window.turnstile.remove(widget.current)}catch(error){console.warn('Turnstile cleanup failed',error)}widget.current=null}};
 },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(status==='sending')return;if(!token){setFeedback(t.verify);setStatus('error');return}
 const form=e.currentTarget;const data=new FormData(form);setStatus('sending');setFeedback('');
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),service:data.get('service'),message:data.get('message'),website:data.get('website'),turnstileToken:token})});
 if(!response.ok)throw Error('Failed');setStatus('success');setFeedback(t.success);form.reset()}catch{setStatus('error');setFeedback(t.error)}
 finally{setToken('');if(widget.current&&window.turnstile){try{window.turnstile.reset(widget.current)}catch(error){console.warn('Turnstile reset failed',error)}}}
 }
 if(!siteKey||!endpoint||turnstileFailed)return <div className="contact-form"><p className="lead">{t.setup}</p><a className="btn primary" href="mailto:contacto@isaiasdiaz.com">✉ contacto@isaiasdiaz.com</a></div>;
 return <form className="contact-form" onSubmit={submit}><div className="form-grid"><label>{t.name}<input name="name" required maxLength={100} autoComplete="name"/></label><label>{t.email}<input name="email" type="email" required maxLength={200} autoComplete="email"/></label></div><label>{t.service}<select name="service" required defaultValue=""><option value="" disabled>{t.choose}</option>{t.services.map(s=><option key={s} value={s}>{s}</option>)}</select></label><label>{t.message}<textarea name="message" required minLength={10} maxLength={4000} rows={5}/></label><div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><div ref={target}/><button className="btn primary" type="submit" disabled={status==='sending'}>{status==='sending'?t.sending:t.send}</button>{feedback&&<p role="status" className={status==='success'?'form-success':'form-error'}>{feedback}</p>}</form>
}
