'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, ArrowRight, ShieldCheck, Check,
  Award, Sliders, ChevronDown, Zap, BookOpen, ShieldAlert,
} from 'lucide-react';
import { ThemeToggleButton } from '../components/theme/ThemeProvider';
import { calculateWeeklyInstallmentAmount } from '../lib/financial/amortization';

export default function LandingPage() {
  const [simAmount, setSimAmount] = useState<number>(20);
  const [simWeeks, setSimWeeks] = useState<number>(4);
  const [guaranteeTab, setGuaranteeTab] = useState<'student' | 'guarantor'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Bug 5 fix: usar el motor oficial de amortización compuesta, igual que el simulador del dashboard.
  // El método anterior usaba interés simple (simAmount * (1 + rate * weeks)) que daba valores distintos.
  const weeklyInstallment = calculateWeeklyInstallmentAmount(simAmount, simWeeks);
  const totalRepayment = Math.round(weeklyInstallment * simWeeks * 100) / 100;
  const totalInterest = Math.round((totalRepayment - simAmount) * 100) / 100;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)', color: 'var(--ink-1)' }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors"
        style={{
          background: 'color-mix(in srgb, var(--surface-0) 88%, transparent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #2563EB 100%)' }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-[16px] tracking-tight" style={{ color: 'var(--ink-1)' }}>
              EduCrédito <span className="text-gradient-brand font-black">UTB</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            <a href="#como-funciona" className="hover:text-[var(--brand)] transition-colors">Cómo funciona</a>
            <a href="#simulador" className="hover:text-[var(--brand)] transition-colors">Calculadora</a>
            <a href="#garantias" className="hover:text-[var(--brand)] transition-colors">Garantías</a>
            <a href="#faq" className="hover:text-[var(--brand)] transition-colors">Preguntas</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggleButton />
            <Link
              href="/login"
              className="btn-ghost"
              style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="btn-primary hidden sm:inline-flex"
              style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SPLIT CON ESFERAS DE BRIGHT GLOW VIBRANTES ──────────────── */}
      <section className="flex-1 border-b relative overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Orbs radiantes y flotantes en el fondo (Atmosfera dinámica) */}
        <div className="glow-orb glow-orb-brand w-[480px] h-[480px] -top-32 -left-32 animate-float" />
        <div className="glow-orb glow-orb-blue w-[420px] h-[420px] bottom-0 -right-24 animate-glow" />
        <div className="glow-orb glow-orb-brand w-[280px] h-[280px] top-1/3 left-1/2 -translate-x-1/2 opacity-30 animate-float" style={{ animationDelay: '2s' }} />

        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Columna izquierda — Copy institucional */}
            <div className="space-y-7 animate-fadein">
              <div
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs transition-transform hover:scale-[1.02] duration-200 cursor-default"
                style={{
                  background: 'color-mix(in srgb, var(--brand) 12%, var(--surface-0))',
                  color: 'var(--brand)',
                  borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Award className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                Tu comunidad te respalda: Fondo Autogestionado UTB
              </div>

              <div>
                <h1
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]"
                  style={{ color: 'var(--ink-1)' }}
                >
                  Microcréditos universitarios.{' '}
                  <span className="text-gradient-brand block mt-1">
                    Justos, claros y sin buró.
                  </span>
                </h1>
                <p
                  className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl font-normal"
                  style={{ color: 'var(--ink-2)' }}
                >
                  Un fondo solidario diseñado y autogestionado en la UTB para financiar tus libros, insumos y viáticos académicos. 
                  Tasa solidaria del <strong className="text-gradient-brand font-bold">8.5% anual</strong> con repago adaptado a tus clases.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#simulador" className="btn-primary">
                  <span>Calcula tu cuota gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link href="/login" className="btn-ghost">
                  Acceder al portal
                </Link>
              </div>

              {/* 3 checkmarks sin bullets */}
              <div className="pt-2 space-y-2.5">
                {[
                  'Sin historial bancario ni buró de crédito',
                  'Cuotas semanales adaptadas al calendario académico',
                  '100% transparente — cero comisiones ocultas',
                ].map((text) => (
                  <p key={text} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--ink-2)' }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--brand-muted)' }}
                    >
                      <Check className="w-3 h-3" style={{ color: 'var(--brand)' }} />
                    </span>
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Columna derecha — Calculadora interactiva flotante con Glassmorphism */}
            <div id="simulador" className="animate-fadein transition-transform duration-500 hover:-translate-y-1">
              <div
                className="rounded-3xl overflow-hidden card-glass border-2 shadow-2xl relative"
                style={{
                  borderColor: 'color-mix(in srgb, var(--brand) 35%, transparent)',
                }}
              >
                {/* Cabecera de la calculadora */}
                <div
                  className="px-6 py-4 border-b flex items-center justify-between backdrop-blur-md"
                  style={{ 
                    borderColor: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
                    background: 'color-mix(in srgb, var(--brand) 6%, transparent)' 
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--ink-1)' }}>
                      Terminal de Simulación en Vivo
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full border animate-pulse"
                    style={{ 
                      background: 'color-mix(in srgb, var(--brand) 15%, var(--surface-0))', 
                      color: 'var(--brand)',
                      borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' 
                    }}
                  >
                    ⚡ 8.5% anual · Tasa fija
                  </span>
                </div>

                {/* Controles */}
                <div className="p-7 space-y-7">
                  {/* Slider de monto */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>
                        Monto a solicitar
                      </label>
                      <span
                        className="text-2xl font-black tabular-nums text-gradient-brand"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        ${simAmount}.00 USD
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      step="5"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer shadow-inner transition-all duration-150"
                      style={{ background: 'var(--surface-2)', accentColor: 'var(--brand)' }}
                    />
                    <div
                      className="flex justify-between text-xs font-semibold"
                      style={{ color: 'var(--ink-3)' }}
                    >
                      <span className="hover:text-[var(--brand)] transition-colors cursor-pointer" onClick={() => setSimAmount(10)}>$10 mín.</span>
                      <span className="hover:text-[var(--brand)] transition-colors cursor-pointer" onClick={() => setSimAmount(15)}>$15</span>
                      <span className="hover:text-[var(--brand)] transition-colors cursor-pointer" onClick={() => setSimAmount(20)}>$20</span>
                      <span className="hover:text-[var(--brand)] transition-colors cursor-pointer" onClick={() => setSimAmount(25)}>$25</span>
                      <span className="hover:text-[var(--brand)] transition-colors cursor-pointer" onClick={() => setSimAmount(30)}>$30 máx.</span>
                    </div>
                  </div>

                  {/* Plazo — Alineado a las reglas cooperativas [1, 2, 4, 8] */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>
                      Plazo de repago reglamentario
                    </label>
                    <div className="relative">
                      <select
                        value={simWeeks}
                        onChange={(e) => setSimWeeks(Number(e.target.value))}
                        className="input-bank font-semibold text-sm appearance-none pr-10 border-2 transition-all hover:border-[var(--brand)]"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value={1}>1 semana — (1 cuota semanal)</option>
                        <option value={2}>2 semanas — (15 días · 2 cuotas)</option>
                        <option value={4}>4 semanas — (1 mes · 4 cuotas)</option>
                        <option value={8}>8 semanas — (2 meses · 8 cuotas)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" style={{ color: 'var(--ink-1)' }} />
                    </div>
                  </div>

                  {/* Resultado radiante */}
                  <div
                    className="rounded-2xl p-6 space-y-4 border relative overflow-hidden transition-all duration-300"
                    style={{ 
                      background: 'color-mix(in srgb, var(--brand) 5%, var(--surface-0))',
                      borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gradient-brand">
                          Cuota semanal estimada
                        </p>
                        <p
                          className="text-4xl font-black tabular-nums mt-1 tracking-tight"
                          style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}
                        >
                          ${weeklyInstallment.toFixed(2)}
                          <span className="text-sm font-bold opacity-70 ml-1.5 font-sans">
                            / sem
                          </span>
                        </p>
                      </div>
                      <div
                        className="text-right text-xs space-y-1 font-medium bg-[var(--surface-0)] p-2.5 rounded-xl border border-[var(--border-subtle)]"
                        style={{ color: 'var(--ink-2)' }}
                      >
                        <p>Capital: <strong className="font-mono" style={{ color: 'var(--ink-1)' }}>${simAmount.toFixed(2)}</strong></p>
                        <p>Interés: <strong className="font-mono text-emerald-600 dark:text-emerald-400">${totalInterest.toFixed(2)}</strong></p>
                        <p className="border-t pt-1 mt-1 border-[var(--border-subtle)] font-bold">Total: <strong className="font-mono text-gradient-brand">${totalRepayment.toFixed(2)}</strong></p>
                      </div>
                    </div>

                    <Link
                      href={`/register?amount=${simAmount}&weeks=${simWeeks}`}
                      className="btn-primary w-full h-12 text-base font-bold shadow-lg shadow-emerald-500/25 transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <Zap className="w-5 h-5 fill-white animate-bounce" />
                      Solicitar este cupo estudiantil ahora
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────── */}
      <section
        id="como-funciona"
        className="py-20 px-6 border-b"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
              Proceso simple
            </p>
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--ink-1)' }}
            >
              Diseñado en torno al calendario académico
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
              Sin trámites bancarios complejos. Tu cédula y el respaldo de tu comunidad UTB son suficientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Elige tu cupo',
                desc: 'Selecciona tu monto ($10–$30 USD) y tu plazo reglamentario de 1 a 8 semanas en el terminal en vivo.',
              },
              {
                n: '02',
                title: 'Verifica a tu garante',
                desc: 'Registra la cédula o correo de tu compañero de facultad. Si cursas 1er semestre, debe cursar 2do o superior.',
              },
              {
                n: '03',
                title: 'Cuotas solidarias',
                desc: 'Recibe el desembolso con 7 días de gracia inicial y cuotas semanales fijas. Al finalizar, tu cupo se renueva 100%.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="card card-hover p-8 relative overflow-hidden group cursor-default"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-emerald-500/20 transition-all duration-300" />
                <span
                  className="text-5xl font-black tabular-nums block mb-5 leading-none transition-transform duration-300 group-hover:scale-110"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <span className="text-gradient-brand opacity-40 group-hover:opacity-100 transition-opacity">{step.n}</span>
                </span>
                <h3 className="text-lg font-extrabold mb-2.5 group-hover:text-[var(--brand)] transition-colors" style={{ color: 'var(--ink-1)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍAS ──────────────────────────────────────── */}
      <section
        id="garantias"
        className="py-20 px-6 border-b"
        style={{ background: 'var(--surface-page)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
              Compromiso solidario
            </p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ink-1)' }}>
              Un ecosistema donde ganamos todos
            </h2>
          </div>

          {/* Selector de rol */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex p-1 rounded-xl border"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
            >
              {[
                { key: 'student' as const, label: 'Estudiante solicitante' },
                { key: 'guarantor' as const, label: 'Garante solidario' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setGuaranteeTab(tab.key)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: guaranteeTab === tab.key ? 'var(--surface-0)' : 'transparent',
                    color: guaranteeTab === tab.key ? 'var(--ink-1)' : 'var(--ink-3)',
                    boxShadow: guaranteeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                    fontWeight: guaranteeTab === tab.key ? '600' : '400',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {guaranteeTab === 'student' ? (
              <div
                key="student"
                className="card p-6 space-y-4 animate-fadein"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--brand-muted)' }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--ink-1)' }}>Sin obstáculos comerciales</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                  Tu principal activo es tu constancia académica en la UTB y el compañerismo solidario de tus colegas de facultad. No revisamos burós externos.
                </p>
                <div className="pt-3 space-y-2.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  {[
                    'Sin centrales de riesgo ni historial bancario requerido',
                    'Renovación inmediata al liquidar tus cuotas',
                    'Comprobante digital descargable en cada abono',
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                      <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key="guarantor"
                className="card p-6 space-y-4 animate-fadein"
                style={{ borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)', borderWidth: '1.5px' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--brand-muted)' }}
                  >
                    <ShieldCheck className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--ink-1)' }}>Respaldando a tus compañeros</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                  Un estudiante de cursos avanzados puede ser garante solidario de uno o varios compañeros de su facultad, fomentando un lazo de apoyo mutuo.
                </p>
                <div className="pt-3 space-y-2.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />
                    Garantías múltiples permitidas con buena conducta crediticia
                  </p>
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--warning)' }}>
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Recibes notificación si tu garantizado acumula 2+ semanas en mora
                  </p>
                </div>
              </div>
            )}

            {/* Parámetros del fondo con efecto card-hover */}
            <div className="card card-hover p-7 space-y-5 border-2 relative overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-gradient-brand">Parámetros del Fondo Rotativo</h3>
                <span className="badge badge-success font-bold">UTB Activo</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Cupo mínimo', value: '$10.00', sub: 'Para copias, guías e insumos' },
                  { label: 'Cupo máximo', value: '$30.00', sub: 'Tope institucional por estudiante' },
                  { label: 'Plazos permitidos', value: '1, 2, 4 y 8 sem.', sub: 'Sincronizado con tus viáticos' },
                  { label: 'Tasa solidaria', value: '8.5% anual', sub: 'Fija e institucional, sin comisiones' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-2xl border transition-colors hover:border-[var(--brand)]"
                    style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>{item.sub}</p>
                    </div>
                    <span
                      className="font-black text-base tabular-nums bg-[var(--surface-0)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] shadow-xs"
                      style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)' }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="btn-primary w-full h-11 text-base font-bold shadow-md shadow-emerald-500/20"
                style={{ marginTop: '8px' }}
              >
                Registrarme en la comunidad
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section
        id="faq"
        className="py-20 px-6 border-b"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ink-1)' }}>
              Preguntas frecuentes
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
              Todo lo que necesitas saber antes de solicitar tu microcrédito.
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                q: '¿Cómo funciona el calendario de repago semanal?',
                a: 'El sistema programa las cuotas semanalmente y te otorga 7 días exactos de gracia inicial desde el desembolso antes de tu primera cuota.',
              },
              {
                q: '¿Para qué se usa el promedio del semestre anterior?',
                a: 'Es una nota informativa de valor curricular para la secretaría administrativa que supervisa la aprobación. Te pedimos declararlo con veracidad en el formulario.',
              },
              {
                q: '¿Qué sucede con el garante si un estudiante se atrasa?',
                a: 'Si acumulas dos semanas o más en mora, el saldo pendiente se reporta en el portal de tu garante para que coordinen el pago responsablemente.',
              },
              {
                q: '¿Puedo cancelar todas las cuotas antes de tiempo?',
                a: '¡Sí! En tu portal puedes liquidar anticipadamente. Recibirás tu recibo digital de inmediato y tu cupo se renovará al 100%.',
              },
              {
                q: '¿Cómo obtengo mi comprobante de pago?',
                a: 'Cada pago registrado genera automáticamente un comprobante electrónico institucional encriptado SSL, descargable e imprimible.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border overflow-hidden transition-all"
                  style={{ borderColor: isOpen ? 'color-mix(in srgb, var(--brand) 25%, transparent)' : 'var(--border-subtle)' }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors"
                    style={{
                      background: isOpen ? 'var(--brand-muted)' : 'var(--surface-0)',
                      color: 'var(--ink-1)',
                    }}
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--brand)' }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-5 py-4 text-sm leading-relaxed border-t animate-fadein"
                      style={{ color: 'var(--ink-2)', borderColor: 'var(--border-subtle)' }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-12 px-6" style={{ background: 'var(--ink-1)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              EduCrédito UTB
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'var(--ink-3)' }}>
            <a href="#simulador" className="hover:text-white transition-colors">Calculadora</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Metodología</a>
            <a href="#garantias" className="hover:text-white transition-colors">Garantías</a>
            <Link href="/login" className="hover:text-white transition-colors font-semibold" style={{ color: 'var(--brand)' }}>
              Portal Estudiantil
            </Link>
          </div>

          <p className="text-xs text-center sm:text-right" style={{ color: 'var(--ink-3)' }}>
            © 2026 Universidad Técnica de Babahoyo (UTB)
          </p>
        </div>
      </footer>

    </div>
  );
}
