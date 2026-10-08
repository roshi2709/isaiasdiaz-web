import Link from 'next/link';
export default function Root(){return <main className="redirect"><h1>Isaías Díaz</h1><p>Elige tu idioma / Choose your language / Escolha seu idioma</p><div><Link href="/es/">Español</Link><Link href="/en/">English</Link><Link href="/pt/">Português</Link></div></main>}
