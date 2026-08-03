'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, ArrowRight, ShieldCheck, Clock, DollarSign, 
  Users, HelpCircle, ChevronRight, ChevronDown, Lock, CheckCircle2, 
  Award, Sparkles, Sliders, Calendar, Zap, Check, ShieldAlert, BookOpen
} from 'lucide-react';
import { ThemeToggleButton } from '../components/theme/ThemeProvider';

export default function LandingPage() {
  // Estado para la calculadora interactiva rápida en vivo del Hero
  const [simAmount, setSimAmount] = useState<number>(20);
  const [simWeeks, setSimWeeks] = useState<number>(4);

  // Estado para las pestañas interactivas de Garantías (Estudiante vs Garante)
  const [guaranteeTab, setGuaranteeTab] = useState<'student' | 'guarantor'>('student');

  // Estado para el acordeón interactivo de Preguntas Frecuentes (FAQ)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Cálculo financiero ágil y transparente (Tasa 8.5% anual prorrateada por semana)
  const weeklyRate = (0.085 / 52);
  const totalRepayment = simAmount * (1 + weeklyRate * simWeeks);
  const weeklyInstallment = totalRepayment / simWeeks;
  const totalInterest = totalRepayment - simAmount;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans selection:bg-emerald-500/30">
      
      {/* NAVEGACIÓN INSTITUCIONAL */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white hover:opacity-90 transition group">
            <div className="p-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm transform group-hover:rotate-6 transition-transform duration-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="tracking-tight font-bold text-lg">EduCrédito <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">UTB</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#simulador" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Calculadora</a>
            <a href="#como-funciona" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Cómo funciona</a>
            <a href="#garante-interactivo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Respaldo solidario</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Preguntas frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link 
              href="/login"
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-200/70 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition transform active:scale-95 hidden sm:flex items-center"
            >
              Registro con Cédula
            </Link>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO Minimalista con Profundidad y Luz Ambiental */}
      <section className="relative px-6 pt-16 pb-20 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Luces Ambientales (Glassmorphism sutil, sin saturación) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-emerald-500/5 to-blue-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300/60 dark:border-emerald-800 shadow-xs animate-fadeIn">
            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tu comunidad te respalda: Microcréditos exclusivos para estudiantes.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-[1.15]">
            Microcréditos Universitarios <br className="hidden sm:inline" />
            <span className="text-emerald-700 dark:text-emerald-400 bg-clip-text">Justos, Claros y Sin Buró de Crédito.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Un fondo solidario autogestionado para financiar tus materiales, libros de especialidad y viáticos académicos. Tasa fija institucional del 8.5% anual con cuotas flexibles y transparentes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#simulador"
              className="w-full sm:w-auto h-12 px-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-md hover:shadow-emerald-700/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 duration-150 group"
            >
              <span>Calcula tu cuota gratis</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto h-12 px-8 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm transition flex items-center justify-center shadow-xs"
            >
              Ingresar a mi cuenta
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Validación rápida con tu cédula</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Pagos flexibles a tu ritmo</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 100% transparente: Cero comisiones ocultas</span>
          </div>
        </div>

        {/* CALCULADORA INTERACTIVA EN VIVO (HERO COMPREHENSIVE COMPONENT) */}
        <div id="simulador" className="max-w-4xl mx-auto mt-16 p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#0E1422]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative z-20">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Simulador Interactivo en Vivo</h3>
                <p className="text-xs text-slate-500">Prueba cómo quedarían tus cuotas de repago semanal</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tasa Fija Solidaria: 8.5% Anual
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controles de monto y plazo */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Monto deseado */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Monto que deseas solicitar ($10 a $30 USD):</span>
                  <span className="text-base font-mono font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    ${simAmount}.00 USD
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="5"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                  <span>$10 (Min)</span>
                  <span>$15</span>
                  <span>$20</span>
                  <span>$25</span>
                  <span>$30 (Máx)</span>
                </div>
              </div>

              {/* Plazo del crédito en semanas */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Selecciona el plazo para abonar tu microcrédito:
                </label>
                <select
                  value={simWeeks}
                  onChange={(e) => setSimWeeks(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
                >
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((w) => (
                    <option key={w} value={w}>
                      {w} {w === 1 ? 'semana' : 'semanas'} de plazo ({w} {w === 1 ? 'cuota semanal' : 'cuotas semanales'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 italic">
                  * Recuerda que cuentas con 7 días calendario de gracia inicial antes de tu primer cobro.
                </p>
              </div>

            </div>

            {/* Resultado Financiero Transparente */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-xl flex flex-col justify-between space-y-4 border border-emerald-500/20">
              <div>
                <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider block">
                  Tu cuota estimada por semana
                </span>
                <div className="text-4xl font-extrabold font-mono mt-1 tracking-tight">
                  ${weeklyInstallment.toFixed(2)} <span className="text-sm font-normal text-slate-300">/ sem</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Capital neto solicitado:</span>
                  <span className="font-mono font-semibold text-white">${simAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Interés cooperatorio (8.5% anual):</span>
                  <span className="font-mono font-semibold text-emerald-300">${totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                  <span>Total a devolver al fondo:</span>
                  <span className="font-mono">${totalRepayment.toFixed(2)} USD</span>
                </div>
              </div>

              <Link
                href={`/register?amount=${simAmount}&weeks=${simWeeks}`}
                className="w-full py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wide text-center transition transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" /> ¡Solicitar este cupo ahora!
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA - TARJETAS INTERACTIVAS CON HOVER EFECTOS */}
      <section id="como-funciona" className="py-24 px-6 bg-white dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Metodología Financiera
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
              Un proceso ágil diseñado en torno al calendario académico
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Sin trámites bancarios complejos. Validamos tu identidad mediante tu cédula y el respaldo de la comunidad de la UTB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="group p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0E1422] space-y-4 hover:border-emerald-500/80 dark:hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-lg shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Elige tu cupo en línea
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Escribe el monto que deseas solicitar (desde $10 hasta $30 USD) y abre la lista desplegable para seleccionar tu plazo de repago de 1 a 12 semanas de acuerdo a tus necesidades.
              </p>
            </div>

            <div className="group p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0E1422] space-y-4 hover:border-emerald-500/80 dark:hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-lg shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Verifica tu Garante UTB
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Registra la cédula de tu compañero garante. Si eres estudiante de primer semestre, el sistema verifica que tu garante curse el segundo semestre o superior para darte respaldo.
              </p>
            </div>

            <div className="group p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0E1422] space-y-4 hover:border-emerald-500/80 dark:hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-lg shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Repago semanal flexible
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recibe el desembolso institucional con 7 días completos de gracia inicial y realiza tus abonos obligatorios con cuotas fijas semanales para recuperar e incrementar tu historial.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* GARANTÍAS Y RESPALDO CON PESTAÑAS INTERACTIVAS */}
      <section id="garante-interactivo" className="py-24 px-6 bg-slate-50/70 dark:bg-[#0B0F1A] border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
              Compromiso Solidario Universitario
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Un ecosistema donde ganamos todos
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Explora cómo funciona nuestra estructura de confianza colectiva para cada uno de los roles dentro del fondo rotativo.
            </p>

            {/* Selector interactivo de rol */}
            <div className="inline-flex p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 mt-4 border border-slate-300/60 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setGuaranteeTab('student')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  guaranteeTab === 'student'
                    ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👨‍🎓 Para el Estudiante Solicitante
              </button>
              <button
                type="button"
                onClick={() => setGuaranteeTab('guarantor')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  guaranteeTab === 'guarantor'
                    ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                🤝 Para el Garante Solidario
              </button>
            </div>
          </div>

          {/* Contenido Dinámico según la Pestaña Seleccionada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {guaranteeTab === 'student' ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sin obstáculos comerciales</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sabemos que en tu etapa universitaria aún no posees un historial bancario formal. Aquí tu principal activo es tu constancia académica en la UTB y el compañerismo solidario de tus colegas de facultad.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> No revisamos centrales de riesgo ni burós bancarios externos.</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Liberación inmediata y renovación al cancelar tus cuotas semanales.</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Comprobante digital bancario descargable en cada abono realizado.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1422] border-2 border-emerald-500/50 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Respaldando a tus compañeros</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Un estudiante de cursos avanzados puede ser garante solidario de uno o varios compañeros de su facultad, fomentando un lazo de apoyo mutuo para que nadie se quede sin estudiar por falta de materiales.
                  </p>
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Garantías múltiples permitidas para estudiantes con buena conducta.</div>
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold"><ShieldAlert className="w-4 h-4 shrink-0" /> Notificación automática al garante si el solicitante acumula 2 o más semanas en mora.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen constante en vivo */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Parámetros del Fondo Rotativo</h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Cupo Mínimo Disponible</p>
                    <p className="text-slate-500 mt-0.5">Apoyo directo para copias, guías e insumos</p>
                  </div>
                  <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">$10.00</span>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Cupo Máximo Disponible</p>
                    <p className="text-slate-500 mt-0.5">Tope institucional por cada estudiante</p>
                  </div>
                  <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">$30.00</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Plazo Cooperativo Semanal</p>
                    <p className="text-slate-500 mt-0.5">Sincronizado con tus viáticos académicos</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">1 a 12 Semanas</span>
                </div>
              </div>
              
              <Link 
                href="/register"
                className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                Registrarme en la plataforma UTB
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ ACORDEÓN INTERACTIVO) */}
      <section id="faq" className="py-24 px-6 bg-white dark:bg-[#090D16]">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Preguntas Frecuentes y Ayuda
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Haz clic en cualquier pregunta para expandir su respuesta oficial.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "¿Cómo funciona el calendario del repago semanal?",
                a: "El calendario de amortización programa las cuotas semanalmente para coincidir de forma ordenada con tus viáticos universitarios. Además, el sistema te otorga 7 días exactos de gracia inicial desde el desembolso antes de tu primera cuota hábil."
              },
              {
                q: "¿Para qué sirve declarar el promedio general del semestre anterior?",
                a: "Es una nota informativa de valor curricular para la secretaría administrativa de la UTB que supervisa la aprobación o rechazo del crédito. Te pedimos declararlo con total veracidad en el formulario de solicitud."
              },
              {
                q: "¿Qué sucede con el garante solidario si un estudiante se atrasa en sus pagos?",
                a: "Si un estudiante acumula dos semanas o más en mora de sus cuotas semanales, el saldo pendiente pasará a reportarse automáticamente en el portal de su compañero garante, para que puedan coordinar responsablemente el pago y mantener la reputación crediticia del grupo."
              },
              {
                q: "¿Puedo cancelar o abonar todas las cuotas antes de tiempo?",
                a: "¡Sí! Dentro del portal estudiantil puedes liquidar tus cuotas anticipadamente o abonar la totalidad en cualquier momento. Esto generará de inmediato tu recibo bancario digital y renovará el 100% de tu cupo disponible."
              },
              {
                q: "¿Cómo obtengo mi recibo oficial al realizar el pago de mis cuotas?",
                a: "Cada vez que registres el pago de una cuota desde tu panel de estudiante, el sistema generará de forma automática en vivo un Comprobante Electrónico Institucional encriptado SSL Módulo 10, con opción de descarga e impresión."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-slate-200 dark:border-slate-800/90 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left bg-slate-50/50 dark:bg-[#0E1422] hover:bg-slate-100/60 dark:hover:bg-slate-900 transition flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-3 bg-white dark:bg-[#0E1422]/60 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA SOBRIO BANCARIO */}
      <footer className="mt-auto py-12 px-6 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span>EduCrédito UTB • Sistema Financiero Estudiantil</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#simulador" className="hover:text-white transition">Calculadora</a>
            <a href="#como-funciona" className="hover:text-white transition">Metodología</a>
            <a href="#garante-interactivo" className="hover:text-white transition">Garantías</a>
            <Link href="/login" className="hover:text-white transition font-semibold text-emerald-400">Portal Estudiantil</Link>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            © 2026 Universidad Técnica de Babahoyo (UTB). Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
