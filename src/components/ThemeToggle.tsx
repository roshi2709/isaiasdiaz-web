'use client';
import {useEffect,useState} from 'react';
export default function ThemeToggle({label}:{label:string}) {
 const [dark,setDark]=useState(false);
 useEffect(()=>{const stored=localStorage.getItem('theme');const isDark=stored?stored==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=isDark?'dark':'light';setDark(isDark)},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';localStorage.setItem('theme',next?'dark':'light')}
 return <button className="theme" onClick={toggle} aria-label={label} title={label}>{dark?'☀️':'🌙'}</button>;
}
