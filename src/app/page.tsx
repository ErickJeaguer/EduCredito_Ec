'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, ArrowRight, ShieldCheck, CheckCircle2,
  ChevronDown, Sparkles, Sliders, Check, ShieldAlert, BookOpen,
  Zap, HandHeart, Wallet, CalendarClock,
} from 'lucide-react';
import { ThemeToggleButton } from '../components/theme/ThemeProvider';
import {
  ANNUAL_INTEREST_RATE,
  generateAmortizationSchedule,
} from '../lib/financial/amortization';

// Plazos realmente admitidos por el fondo (coincide con el motor de reglas)
const TERM_OPTIONS = [1, 2, 4, 8];

export default function LandingPage() {
  const [simAmount, setSimAmount] = useState<number>(20);
  const [simWeeks, setSimWeeks] = useState<number>(4);
  const [guaranteeTab, setGuaranteeTab] = useState<'student' | 'guarantor'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Usa el MISMO motor de amortización que el simulador real del panel
  const { weeklyInstallment, totalRepayment, totalInterest } = useMemo(() => {
    const result = generateAmortizationSchedule(simAmount, simWeeks);
    return {
      weeklyInstallment: result.weeklyPaymentAmount,
      totalRepayment: result.totalRepayment,
      totalInterest: result.totalInterest,
    };
  }, [simAmount, simWeeks]);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* NAVEGACIÓN INSTITUCIONAL */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition group">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm transform group-hover:rotate-6 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="tracking-tight font-serif font-bold text-lg text-foreground">
              EduCrédito <span className="text-primary">UTB</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#simulador" className="hover:text-primary transition">Calculadora</a>
            <a href="#como-funciona" className="hover:text-primary transition">Cómo funciona</a>
            <a href="#garante-interactivo" className="hover:text-primary transition">Respaldo solidario</a>
            <a href="#faq" className="hover:text-primary transition">Preguntas frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link
              href="/login"
              className="h-9 px-4 rounded-lg text-sm font-semibold bg-muted hover:bg-border text-foreground transition flex items-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 rounded-lg text-sm font-semibold bg-primary hover:opacity-90 text-primary-foreground shadow-sm transition transform active:scale-95 hidden sm:flex items-center"
            >
              Registro con Cédula
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 pt-20 pb-20 border-b border-border overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            <HandHeart className="w-4 h-4 shrink-0" />
            <span>Tu comunidad te respalda: microcréditos entre compañeros de la UTB.</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance">
            Microcréditos universitarios
            <span className="block text-primary">justos, claros y sin buró de crédito.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Un fondo solidario autogestionado para financiar tus materiales, libros de especialidad y viáticos
            académicos. Tasa fija institucional del {ANNUAL_INTEREST_RATE.toFixed(2)}% anual con cuotas semanales
            transparentes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#simulador"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition shadow-md flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 duration-150 group"
            >
              <span>Calcula tu cuota gratis</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-sm transition flex items-center justify-center shadow-sm"
            >
              Ingresar a mi cuenta
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Validación rápida con tu cédula</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Pagos flexibles a tu ritmo</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 100% transparente: cero comisiones ocultas</span>
          </div>
        </div>

        {/* CALCULADORA INTERACTIVA */}
        <div id="simulador" className="max-w-4xl mx-auto mt-16 p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl relative z-20">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-card-foreground">Simulador interactivo en vivo</h3>
                <p className="text-sm text-muted-foreground">Prueba cómo quedarían tus cuotas de repago semanal</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Sparkles className="w-3.5 h-3.5" /> Tasa fija solidaria: {ANNUAL_INTEREST_RATE.toFixed(2)}% anual
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controles */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-foreground">
                  <span>Monto que deseas solicitar ($10 a $30 USD):</span>
                  <span className="text-base font-serif font-bold tabular-nums text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                    ${simAmount}.00
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Monto a solicitar"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-medium px-1">
                  <span>$10</span><span>$15</span><span>$20</span><span>$25</span><span>$30</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-foreground">
                  Selecciona el plazo para abonar tu microcrédito:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {TERM_OPTIONS.map((w) => {
                    const active = simWeeks === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSimWeeks(w)}
                        className={`h-12 rounded-xl border text-sm font-bold transition transform active:scale-95 ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card text-foreground border-border hover:border-primary/50'
                        }`}
                        aria-pressed={active}
                      >
                        {w} {w === 1 ? 'sem' : 'sems'}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  * Cuentas con 7 días calendario de gracia inicial antes de tu primer cobro.
                </p>
              </div>
            </div>

            {/* Resultado */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-primary text-primary-foreground shadow-lg flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-80">
                  Tu cuota estimada por semana
                </span>
                <div className="font-serif text-4xl font-bold tabular-nums mt-1 tracking-tight">
                  ${weeklyInstallment.toFixed(2)}
                  <span className="text-sm font-normal opacity-70"> / sem</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-primary-foreground/15 text-sm">
                <div className="flex justify-between opacity-80">
                  <span>Capital solicitado:</span>
                  <span className="font-semibold tabular-nums">${simAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Interés cooperativo:</span>
                  <span className="font-semibold tabular-nums">${totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-primary-foreground/10">
                  <span>Total a devolver:</span>
                  <span className="tabular-nums">${totalRepayment.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href={`/register?amount=${simAmount}&weeks=${simWeeks}`}
                className="w-full py-3 px-4 rounded-lg bg-accent hover:opacity-90 text-accent-foreground font-bold text-xs uppercase tracking-wide text-center transition transform active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Solicitar este cupo ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Metodología financiera
            </p>
            <h2 className="font-serif text-3xl font-semibold text-foreground tracking-tight mt-2 text-balance">
              Un proceso ágil diseñado en torno al calendario académico
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Sin trámites bancarios complejos. Validamos tu identidad mediante tu cédula y el respaldo de la
              comunidad de la UTB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: 'Elige tu cupo en línea',
                desc: 'Indica el monto que deseas solicitar (desde $10 hasta $30 USD) y selecciona el plazo de repago que mejor se adapte a tus necesidades.',
              },
              {
                icon: ShieldCheck,
                title: 'Verifica tu garante UTB',
                desc: 'Registra la cédula de tu compañero garante. El sistema valida que tu garante curse un semestre igual o superior para darte respaldo.',
              },
              {
                icon: CalendarClock,
                title: 'Repago semanal flexible',
                desc: 'Recibe el desembolso institucional con 7 días completos de gracia inicial y realiza tus abonos con cuotas fijas semanales.',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group p-7 rounded-2xl border border-border bg-card space-y-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-3xl font-semibold text-border group-hover:text-primary/30 transition">
                      {`0${i + 1}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GARANTÍAS Y RESPALDO */}
      <section id="garante-interactivo" className="py-24 px-6 border-b border-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase text-primary tracking-wider">
              Compromiso solidario universitario
            </span>
            <h2 className="font-serif text-3xl font-semibold text-foreground tracking-tight text-balance">
              Un ecosistema donde ganamos todos
            </h2>
            <p className="text-sm text-muted-foreground">
              Explora cómo funciona nuestra estructura de confianza colectiva para cada rol dentro del fondo rotativo.
            </p>

            <div className="inline-flex p-1.5 rounded-xl bg-muted mt-4 border border-border">
              <button
                type="button"
                onClick={() => setGuaranteeTab('student')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  guaranteeTab === 'student'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Estudiante
              </button>
              <button
                type="button"
                onClick={() => setGuaranteeTab('guarantor')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  guaranteeTab === 'guarantor'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <HandHeart className="w-4 h-4" /> Garante
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {guaranteeTab === 'student' ? (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">Sin obstáculos comerciales</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sabemos que en tu etapa universitaria aún no posees un historial bancario formal. Aquí tu principal
                  activo es tu constancia académica en la UTB y el compañerismo solidario de tus colegas de facultad.
                </p>
                <div className="space-y-2 pt-3 border-t border-border text-sm text-foreground font-medium">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> No revisamos centrales de riesgo ni burós externos.</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Renovación inmediata al cancelar tus cuotas semanales.</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Comprobante digital descargable en cada abono realizado.</div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-card border-2 border-primary/40 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">Respaldando a tus compañeros</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Un estudiante de cursos avanzados puede ser garante solidario de uno o varios compañeros de su
                  facultad, fomentando un lazo de apoyo mutuo para que nadie se quede sin estudiar por falta de materiales.
                </p>
                <div className="space-y-2.5 pt-3 border-t border-border text-sm text-foreground font-medium">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success shrink-0" /> Garantías múltiples permitidas para estudiantes con buena conducta.</div>
                  <div className="flex items-center gap-2 text-warning font-semibold"><ShieldAlert className="w-4 h-4 shrink-0" /> Notificación automática si el solicitante acumula 2 o más semanas en mora.</div>
                </div>
              </div>
            )}

            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-semibold text-card-foreground">Parámetros del fondo rotativo</h3>
              <div className="space-y-3">
                {[
                  { title: 'Cupo mínimo disponible', desc: 'Apoyo directo para copias, guías e insumos', value: '$10.00' },
                  { title: 'Cupo máximo disponible', desc: 'Tope institucional por cada estudiante', value: '$30.00' },
                  { title: 'Plazo cooperativo semanal', desc: 'Sincronizado con tus viáticos académicos', value: '1 a 8 sem' },
                ].map((row) => (
                  <div key={row.title} className="p-4 rounded-lg bg-muted/60 border border-border flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-card-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
                    </div>
                    <span className="font-serif text-lg font-bold tabular-nums text-primary shrink-0">{row.value}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="w-full h-11 rounded-lg bg-foreground hover:opacity-90 text-background font-semibold text-sm transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                Registrarme en la plataforma UTB
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Preguntas frecuentes y ayuda
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Haz clic en cualquier pregunta para expandir su respuesta oficial.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cómo funciona el calendario del repago semanal?',
                a: 'El calendario de amortización programa las cuotas semanalmente para coincidir de forma ordenada con tus viáticos universitarios. Además, el sistema te otorga 7 días exactos de gracia inicial desde el desembolso antes de tu primera cuota hábil.',
              },
              {
                q: '¿Para qué sirve declarar el promedio general del semestre anterior?',
                a: 'Es una nota informativa de valor curricular para la secretaría administrativa de la UTB que supervisa la aprobación o rechazo del crédito. Te pedimos declararlo con total veracidad en el formulario de solicitud.',
              },
              {
                q: '¿Qué sucede con el garante solidario si un estudiante se atrasa en sus pagos?',
                a: 'Si un estudiante acumula dos semanas o más en mora de sus cuotas, el saldo pendiente pasará a reportarse en el portal de su compañero garante, para que puedan coordinar responsablemente el pago y mantener la reputación crediticia del grupo.',
              },
              {
                q: '¿Puedo cancelar o abonar todas las cuotas antes de tiempo?',
                a: 'Sí. Dentro del portal estudiantil puedes liquidar tus cuotas anticipadamente o abonar la totalidad en cualquier momento. Esto generará de inmediato tu recibo digital y renovará el 100% de tu cupo disponible.',
              },
              {
                q: '¿Cómo obtengo mi recibo oficial al realizar el pago de mis cuotas?',
                a: 'Cada vez que registres el pago de una cuota desde tu panel, el sistema generará de forma automática un comprobante electrónico institucional, con opción de descarga e impresión.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="rounded-xl border border-border overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left bg-card hover:bg-muted/60 transition flex items-center justify-between gap-4 font-bold text-sm text-card-foreground"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-3 bg-card text-sm text-muted-foreground leading-relaxed border-t border-border">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-12 px-6 bg-primary text-primary-foreground text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-serif font-bold">
            <GraduationCap className="w-5 h-5" />
            <span>EduCrédito UTB · Sistema Financiero Estudiantil</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#simulador" className="opacity-80 hover:opacity-100 transition">Calculadora</a>
            <a href="#como-funciona" className="opacity-80 hover:opacity-100 transition">Metodología</a>
            <a href="#garante-interactivo" className="opacity-80 hover:opacity-100 transition">Garantías</a>
            <Link href="/login" className="font-semibold underline underline-offset-4">Portal estudiantil</Link>
          </div>
          <p className="opacity-70 text-center sm:text-right">
            © 2026 Universidad Técnica de Babahoyo (UTB).
          </p>
        </div>
      </footer>
    </div>
  );
}
