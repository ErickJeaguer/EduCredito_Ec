'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import {
  GraduationCap, ArrowRight, Loader2, Eye, EyeOff,
  Shield, BookOpen, Zap, Lock, Star
} from 'lucide-react';

const TESTIMONIAL = {
  quote: 'Gracias al fondo cooperativo pude comprar mis materiales de laboratorio sin pedir préstamo a mi familia.',
  author: 'María José Andrade',
  role: 'Ingeniería Ambiental · 6to Semestre',
  rating: 5,
};

const TRUST_ITEMS = [
  { icon: <Shield className="w-4 h-4" />, label: 'Encriptación SSL 256-bit' },
  { icon: <BookOpen className="w-4 h-4" />, label: 'Fondo Cooperativo UTB' },
  { icon: <Zap className="w-4 h-4" />, label: 'Aprobación en 24 horas' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(result.error || 'Credenciales no válidas. Verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-page)' }}>

      {/* ── PANEL IZQUIERDO — Branding & Trust ───────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: '#090E17', color: '#FFFFFF' }}
      >
        {/* Resplandor radial ambiental */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 20% 30%, rgba(0, 196, 140, 0.16) 0%, transparent 70%),
              radial-gradient(ellipse 50% 60% at 80% 80%, rgba(37, 99, 235, 0.12) 0%, transparent 70%)
            `,
          }}
        />

        {/* Anillos decorativos */}
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 opacity-[0.05]"
          aria-hidden
          style={{ width: '500px', height: '500px' }}
        >
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="250" cy="250" r="200" stroke="white" strokeWidth="1"/>
            <circle cx="250" cy="250" r="150" stroke="white" strokeWidth="1"/>
            <circle cx="250" cy="250" r="100" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'var(--brand)' }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">EduCrédito UTB</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Universidad Técnica de Babahoyo
            </p>
          </div>
        </div>

        {/* Copy central */}
        <div className="relative space-y-6 my-auto py-10">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3"
              style={{ background: 'rgba(0, 196, 140, 0.15)', color: '#00C48C', border: '1px solid rgba(0, 196, 140, 0.25)' }}
            >
              Fondo Cooperativo Estudiantil
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Tu educación,<br />
              <span style={{ color: '#00C48C' }}>sin barreras</span><br />
              económicas
            </h1>
            <p className="text-sm leading-relaxed mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Microcréditos solidarios de $10 a $30 USD con tasa del 8.5% anual, exclusivo para estudiantes UTB.
            </p>
          </div>

          {/* Preview de tarjeta de crédito */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Microcrédito activo
              </span>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0, 196, 140, 0.18)', color: '#00C48C', border: '1px solid rgba(0, 196, 140, 0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00C48C' }} />
                En curso
              </span>
            </div>
            <div>
              <p
                className="text-3xl font-extrabold tracking-tight tabular-nums"
                style={{ color: '#FFFFFF', fontFamily: 'monospace' }}
              >
                $28.50
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Saldo pendiente · 4 de 8 cuotas pagadas
              </p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span>50% completado</span>
                <span style={{ color: '#00C48C', fontWeight: 700 }}>$28.50 restantes</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '50%',
                    background: 'linear-gradient(90deg, #006B4E 0%, #00C48C 100%)',
                    boxShadow: '0 0 8px rgba(0, 196, 140, 0.4)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: TESTIMONIAL.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} />
              ))}
            </div>
            <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)' }}>
              "{TESTIMONIAL.quote}"
            </p>
            <p className="text-xs font-bold mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
              — {TESTIMONIAL.author} · {TESTIMONIAL.role}
            </p>
          </div>
        </div>

        {/* Trust items */}
        <div className="relative flex flex-col gap-2 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span style={{ color: 'var(--brand)' }}>{item.icon}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANEL DERECHO — Formulario ────────────────── */}
      <div className="flex-1 px-6 sm:px-12 py-10 relative overflow-y-auto">

        {/* Gradiente sutil de fondo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          aria-hidden
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--brand) 6%, transparent) 0%, transparent 70%)',
          }}
        />

        <div className="w-full max-w-[420px] mx-auto min-h-full flex flex-col justify-center relative animate-fadein py-6">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>EduCrédito UTB</p>
              <p className="text-xs" style={{ color: 'var(--ink-3)' }}>Portal Estudiantil</p>
            </div>
          </div>

          {/* Encabezado del formulario */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink-1)' }}>
              Bienvenido de vuelta
            </h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--ink-3)' }}>
              Ingresa a tu cuenta institucional UTB
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>

            {/* Error */}
            {error && (
              <div
                className="p-3.5 rounded-xl text-sm font-medium animate-fadein"
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
                }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--ink-2)' }}
              >
                Correo institucional
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="estudiante@utb.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-bank"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--ink-2)' }}
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-medium transition-opacity hover:opacity-75"
                  style={{ color: 'var(--brand)' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-bank pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink-3)' }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="btn-primary w-full shadow-lg transition-transform active:scale-[0.99]"
              style={{ height: '48px', fontSize: '15px', marginTop: '12px' }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Ingresar al portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link a registro */}
          <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              ¿Primera vez en la plataforma?{' '}
              <Link
                href="/register"
                className="font-bold transition-opacity hover:opacity-75"
                style={{ color: 'var(--brand)' }}
              >
                Crear cuenta →
              </Link>
            </p>
          </div>

          {/* Sello de seguridad */}
          <div
            className="flex items-center justify-center gap-2 mt-6 text-xs font-medium"
            style={{ color: 'var(--ink-3)' }}
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            Conexión cifrada SSL · Universidad Técnica de Babahoyo
          </div>
        </div>
      </div>
    </div>
  );
}
