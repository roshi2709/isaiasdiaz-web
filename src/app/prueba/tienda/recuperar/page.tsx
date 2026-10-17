import MobilePreviewMenu from '@/components/MobilePreviewMenu';
import PreviewFooter from '@/components/PreviewFooter';
import type { Metadata } from 'next';
import Link from 'next/link';
import RecoveryForm from './RecoveryForm';

export const metadata: Metadata = {
 title: 'Recuperar libros comprados | Isaías Díaz',
 description: 'Solicita nuevos enlaces para descargar los libros digitales que compraste en la tienda de Isaías Díaz.',
 robots: { index: false, follow: false },
};

export default function RecoveryPage() {
 return <div className="studio" style={{minHeight:'100vh'}}>
  <div className="studio-banner">LIBRERÍA DIGITAL · AYUDA CON TU COMPRA <Link href="/prueba/tienda/">Volver a la tienda ↗</Link></div>
  <header className="studio-header"><MobilePreviewMenu/><div className="studio-container studio-header-inner">
   <Link className="studio-logo" href="/prueba/" aria-label="Isaías Díaz, inicio"><img className="studio-brand-image" src="/logo-id.png" alt="Isaías Díaz — Soluciones Digitales"/></Link>
   <nav aria-label="Navegación"><Link href="/prueba/">Inicio</Link><Link href="/prueba/tienda/">Tienda</Link></nav>
   <Link className="studio-header-cta" href="/prueba/contacto/">Contacto ↗</Link>
  </div></header>
  <main className="studio-container" style={{paddingTop:65,paddingBottom:85,maxWidth:850}}>
   <div className="studio-section-kicker">COLECCIÓN DINERO INTELIGENTE / SOPORTE</div>
   <h1 style={{fontSize:'clamp(2.2rem,5vw,3.5rem)',margin:'0 0 20px',letterSpacing:'-.04em'}}>Recupera tus libros digitales</h1>
   <p style={{fontSize:17,lineHeight:1.8,color:'#536782'}}>¿Perdiste el correo o caducó tu enlace de descarga? Si tu compra se completó, puedes solicitar nuevos enlaces sin volver a pagar.</p>
   <RecoveryForm/>
   <section style={{marginTop:32,lineHeight:1.8}}>
    <h2 style={{fontSize:22,letterSpacing:'normal'}}>¿Dónde encuentro mi número de pedido?</h2>
    <p>Revisa el correo de confirmación de PayPal y busca el identificador de pedido de tu compra. Introduce el correo asociado a ese pago, no uno diferente.</p>
    <p>Si no encuentras el identificador, o no recibes el mensaje de recuperación, escríbenos a <a href="mailto:contacto@isaiasdiaz.com" style={{color:'#1259d6'}}>contacto@isaiasdiaz.com</a>. No vuelvas a pagar por el mismo libro.</p>
    <Link href="/prueba/tienda/" style={{color:'#1259d6',fontWeight:700}}>← Volver a la tienda</Link>
   </section>
  </main>
  <PreviewFooter/>
 </div>;
}
