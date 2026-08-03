import React from 'react';
import { GraduationCap, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Luces Ambientales Esmeralda y Oro (Glassmorphic Orbs) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Encabezado y Emblema UTB */}
      <header className="z-10 text-center mb-8 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-600/30 border border-emerald-300/20 text-white transform transition hover:scale-105 duration-300">
          <GraduationCap className="w-9 h-9" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Universidad Técnica de Babahoyo
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Crédito</span> EC
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Fondo Universitario de Microcréditos Solidarios con Inteligencia Financiera
        </p>
      </header>

      {/* Contenedor Principal con Cristal Opaco (macOS Glassmorphism) */}
      <main className="z-10 w-full max-w-md bg-slate-900/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/80 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
        {children}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="z-10 mt-10 text-center text-xs text-slate-500 max-w-md">
        <div className="flex items-center justify-center gap-4 mb-3 text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Seguridad Módulo 10</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Respaldado por UTB</span>
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} EduCréditoEC. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
