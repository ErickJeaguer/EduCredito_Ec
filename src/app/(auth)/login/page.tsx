'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { GraduationCap, ArrowRight, Loader2, CheckCircle2, LockKeyhole } from 'lucide-react';
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
      if (result.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Credenciales no válidas.');
    }
  };

  const highlights = [
    'Sin buró crediticio comercial ni historial bancario requerido.',
    'Cuotas semanales fijas y flexibles con tasa institucional del 8.5% anual.',
    'Respaldo solidario mediante garantes entre compañeros de la UTB.',
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background">

      {/* PANEL IZQUIERDO INSTITUCIONAL */}
      <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="z-10 space-y-8">
          <Link href="/" className="inline-flex items-center gap-3 font-serif font-bold tracking-tight text-lg hover:opacity-90 transition">
            <div className="p-2 bg-primary-foreground/15 rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span>EduCrédito UTB</span>
          </Link>

          <div className="space-y-4 pt-10">
            <h1 className="font-serif text-3xl font-semibold tracking-tight leading-snug text-balance">
              Acceso seguro al sistema crediticio universitario
            </h1>
            <p className="text-sm leading-relaxed max-w-sm opacity-80">
              Plataforma oficial del sistema solidario y autogestionado por estudiantes de la Universidad Técnica de Babahoyo.
            </p>
          </div>

          <div className="space-y-4 pt-6 text-sm opacity-90">
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-accent" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 pt-10 border-t border-primary-foreground/15 flex items-center justify-between text-[11px] opacity-80">
          <span className="flex items-center gap-1.5 font-medium">
            <LockKeyhole className="w-3.5 h-3.5" /> Conexión encriptada SSL
          </span>
          <span>© 2026 EduCrédito UTB</span>
        </div>
      </aside>

      {/* PANEL DERECHO FORMULARIO */}
      <main className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-card text-card-foreground">
        <div className="flex items-center justify-between lg:justify-end mb-8">
          <Link href="/" className="inline-flex lg:hidden items-center gap-2 font-serif font-bold text-foreground">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span>EduCrédito UTB</span>
          </Link>
          <ThemeToggleButton />
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-card-foreground">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Digita tu correo institucional para acceder al portal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-lg bg-danger-soft border border-danger/20 text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Correo institucional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@utb.edu.ec"
                className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                ) : (
                  <>Acceder a mi portal <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-border text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>¿Eres estudiante y aún no te registras?</span>
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Crear cuenta con cédula
            </Link>
          </div>
        </div>

        <div className="mt-12 w-full max-w-md mx-auto text-left">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
