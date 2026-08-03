'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, LockKeyhole } from 'lucide-react';
import { ThemeToggleButton } from '../../../components/theme/ThemeProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Credenciales no válidas.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#090D16] transition-colors duration-300">
      
      {/* PANEL IZQUIERDO: INSTITUCIONAL Y DE SEGURIDAD (5 columnas) */}
      <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-slate-900 text-white border-r border-slate-800 relative overflow-hidden">
        <div className="z-10 space-y-8">
          <Link href="/" className="inline-flex items-center gap-3 font-semibold text-white tracking-tight text-lg hover:opacity-90 transition">
            <div className="p-2 bg-emerald-700 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span>EduCrédito <span className="text-emerald-400 font-bold">UTB</span></span>
          </Link>

          <div className="space-y-4 pt-10">
            <h1 className="text-3xl font-bold tracking-tight text-white leading-snug">
              Acceso Seguro al Sistema Crediticio Universitario
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Plataforma oficial del sistema solidario y autogestionado por estudiantes de la Universidad Técnica de Babahoyo.
            </p>
          </div>

          <div className="space-y-4 pt-6 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sin buró crediticio comercial ni historial bancario requerido.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cuotas fijas de lunes a lunes con tasa institucional del 8.5% anual.</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Respaldo solidario mediante garantes entre compañeros de la UTB.</span>
            </div>
          </div>
        </div>

        <div className="z-10 pt-10 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <LockKeyhole className="w-3.5 h-3.5" /> Conexión encriptada SSL
          </span>
          <span>© 2026 EduCrédito UTB</span>
        </div>

        {/* Fondo decorativo sutil */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      </aside>

      {/* PANEL DERECHO: FORMULARIO DE INICIO DE SESIÓN (7 columnas) */}
      <main className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white dark:bg-[#0E1422] text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Barra superior con botón de tema */}
        <div className="flex items-center justify-between lg:justify-end mb-8">
          <Link href="/" className="inline-flex lg:hidden items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <GraduationCap className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            <span>EduCrédito UTB</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggleButton />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Por favor digita tu correo institucional para acceder al portal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Correo institucional
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@utb.edu.ec"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                ) : (
                  <>Acceder a Mi Portal <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>¿Eres estudiante y aún no te registras?</span>
            <Link href="/register" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              Crear cuenta con Cédula
            </Link>
          </div>
        </div>

        <div className="mt-12 w-full max-w-md mx-auto text-left">
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
