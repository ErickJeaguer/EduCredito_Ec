'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, ArrowRight, ShieldCheck, Clock, DollarSign, 
  Users, HelpCircle, ChevronRight, Lock, CheckCircle2, Award 
} from 'lucide-react';
import { ThemeToggleButton } from '../components/theme/ThemeProvider';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans">
      
      {/* NAVEGACIÓN INSTITUCIONAL */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white hover:opacity-90 transition">
            <div className="p-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="tracking-tight font-bold text-lg">EduCrédito <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">UTB</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#como-funciona" className="hover:text-slate-900 dark:hover:text-white transition">Cómo funciona</a>
            <a href="#beneficios" className="hover:text-slate-900 dark:hover:text-white transition">Beneficios</a>
            <a href="#garantes" className="hover:text-slate-900 dark:hover:text-white transition">Garantías y Respaldo</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition">Preguntas frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link 
              href="/login"
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition hidden sm:flex items-center"
            >
              Registro con Cédula
            </Link>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO Minimalista Bancario (Estilo Stripe/Wise) */}
      <section className="relative px-6 pt-20 pb-28 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1422]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300/60 dark:border-emerald-800">
            <Award className="w-3.5 h-3.5" />
            <span>Sistema Financiero Cooperativo Oficial de Estudiantes UTB</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-[1.15]">
            Microcréditos universitarios <br className="hidden sm:inline" />
            <span className="text-emerald-700 dark:text-emerald-400">justos, claros y sin buró comercial.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Un fondo solidario autogestionado para financiar tus materiales, libros de especialidad y viáticos académicos con cuotas fijas de lunes a lunes y tasa institucional del 8.5% anual.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto h-12 px-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Simular y solicitar crédito</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto h-12 px-8 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm transition flex items-center justify-center"
            >
              Acceso portal de estudiantes
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verificación Registro Civil Módulo 10</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cobros cooperativos Lunes a Lunes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 0% Comisiones ocultas de apertura</span>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-6 bg-white dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Metodología Financiera</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
              Un proceso ágil diseñado en torno al calendario académico
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Sin trámites bancarios complejos. Validamos tu identidad mediante tu cédula y el respaldo de la comunidad de la UTB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1422] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-base">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Elige tu cupo en línea</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Escribe el monto que deseas solicitar (desde $10 hasta $30 USD) y abre la lista desplegable para seleccionar tu plazo de repago de 1 a 12 semanas.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1422] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-base">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Verifica tu Garante UTB</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Registra la cédula de tu compañero garante. Si eres estudiante de primer semestre, tu garante debe cursar el segundo semestre o posterior.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1422] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-base">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Repago semanal los Lunes</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Recibe el desembolso institucional con 7 días de gracia inicial y realiza tus abonos obligatorios con cuotas fijas cada lunes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS Y CONDICIONES SOLIDARIAS */}
      <section id="garantes" className="py-24 px-6 bg-slate-50/50 dark:bg-[#0E1422] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Compromiso Solidario</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Protegiendo el capital de toda la comunidad estudiantil
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              En EduCrédito UTB no requerimos garantes comerciales externos ni cobramos intereses agobiantes de mora bancaria. Dependemos del valor de la responsabilidad mutua entre compañeros universitarios.
            </p>
            
            <div className="space-y-4 pt-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b className="font-semibold text-slate-900 dark:text-white">Garantías múltiples permitidas</b>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Un estudiante de cursos avanzados puede ser garante solidario de varios compañeros de su facultad o carrera.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b className="font-semibold text-slate-900 dark:text-white">Protección ante retrasos (más de 2 semanas)</b>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Si un estudiante acumula dos semanas o más de retraso en sus lunes de repago, el saldo pendiente pasará a registrarse visiblemente en el portal de su garante solidario.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resumen del Fondo Estudiantil</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Monto Mínimo Habilitado</p>
                  <p className="text-slate-500 mt-0.5">Apoyo básico para copias e insumos</p>
                </div>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">$10.00</span>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Monto Máximo Habilitado</p>
                  <p className="text-slate-500 mt-0.5">Tope institucional por estudiante</p>
                </div>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">$30.00</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Plazos Flexibles Desplegables</p>
                  <p className="text-slate-500 mt-0.5">Selección de cuotas para cada lunes</p>
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">1 a 12 Semanas</span>
              </div>
            </div>
            
            <Link 
              href="/register"
              className="w-full h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
            >
              Iniciar proceso en el simulador
            </Link>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" className="py-24 px-6 bg-white dark:bg-[#090D16]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Preguntas frecuentes sobre el fondo
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Resolvemos tus dudas sobre requisitos de matrícula, garantes y cobros semanales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">¿Por qué el repago es exclusivamente los lunes?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                La estructura "Lunes a Lunes" concuerda con la asignación semanal de viáticos de los estudiantes universitarios. Además, incluye 7 días exactos de gracia desde el desembolso antes de tu primera cuota.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">¿Para qué sirve mi promedio general anterior?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Es una nota informativa para la secretaría administrativa de la UTB que aprueba o rechaza los trámites. Te pedimos declararlo con sinceridad conforme al sistema de notas universitario.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">¿Qué pasa si mi garante se atrasa en sus pagos?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El garante debe estar activo en la plataforma y preferiblemente no tener cuotas impagas en su récord para mantener la fluidez del fondo rotativo y evitar bloqueos preventivos de secretaría.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">¿Puedo abonar todo el capital en un solo pago antes de tiempo?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sí, dentro del portal estudiantil puedes liquidar cuotas de forma anticipada cuando lo desees, lo que elevará tu reputación interna para futuros trámites en tu carrera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA SOBRIO BANcario */}
      <footer className="mt-auto py-12 px-6 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span>EduCrédito UTB • Sistema Financiero Estudiantil</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#como-funciona" className="hover:text-white transition">Metodología</a>
            <a href="#garantes" className="hover:text-white transition">Garantías</a>
            <Link href="/login" className="hover:text-white transition">Portal Estudiantil</Link>
          </div>

          <p className="text-slate-500">
            © 2026 Universidad Técnica de Babahoyo (UTB). Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
