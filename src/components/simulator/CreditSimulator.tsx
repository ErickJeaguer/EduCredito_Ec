'use client';

import React, { useState, useMemo } from 'react';
import { generateAmortizationSchedule } from '../../lib/financial/amortization';
import { verifyGuarantorEligibility, type VerifiedGuarantor } from '../../lib/firebase/loans';
import { 
  DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2, 
  ChevronDown, ChevronUp, Loader2, ShieldCheck, UserCheck, Search, BookOpen, GraduationCap 
} from 'lucide-react';

interface CreditSimulatorProps {
  onApply: (amount: number, weeks: number, grade: number, guarantor: VerifiedGuarantor) => Promise<void>;
  isSubmitting: boolean;
  activeRestriction?: string | null;
  applicantUid: string;
  applicantSemester: number;
}

const ALLOWED_AMOUNTS = [
  { value: 30, label: 'Cupo Nivel 1', desc: 'Libros, copias y viáticos semanales', tag: 'Básico' },
  { value: 60, label: 'Cupo Nivel 2', desc: 'Materiales e insumos académicos', tag: 'Estándar' },
  { value: 90, label: 'Cupo Nivel 3', desc: 'Software y proyectos universitarios', tag: 'Máximo' },
];

const ALLOWED_WEEKS = [2, 4, 6, 8, 10, 12];

export default function CreditSimulator({ 
  onApply, isSubmitting, activeRestriction, applicantUid, applicantSemester 
}: CreditSimulatorProps) {
  const [amount, setAmount] = useState<number>(30);
  const [weeks, setWeeks] = useState<number>(4);
  const [showSchedule, setShowSchedule] = useState<boolean>(true);
  
  const [gradeStr, setGradeStr] = useState<string>('');
  const [guarantorIdInput, setGuarantorIdInput] = useState<string>('');
  const [verifiedGuarantor, setVerifiedGuarantor] = useState<VerifiedGuarantor | null>(null);
  const [isVerifyingGuarantor, setIsVerifyingGuarantor] = useState<boolean>(false);
  const [guarantorError, setGuarantorError] = useState<string | null>(null);

  const [confirmed, setConfirmed] = useState<boolean>(false);

  const calculation = useMemo(() => {
    return generateAmortizationSchedule(amount, weeks, new Date());
  }, [amount, weeks]);

  const handleVerifyGuarantor = async () => {
    if (!guarantorIdInput.trim()) {
      setGuarantorError('Por favor ingresa la Cédula o Correo Institucional de tu compañero.');
      return;
    }
    setIsVerifyingGuarantor(true);
    setGuarantorError(null);
    setVerifiedGuarantor(null);

    const result = await verifyGuarantorEligibility(applicantUid, applicantSemester, guarantorIdInput);
    setIsVerifyingGuarantor(false);

    if (result.valid && result.guarantor) {
      setVerifiedGuarantor(result.guarantor);
    } else {
      setGuarantorError(result.error || 'No se pudo validar al compañero garante en el registro.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRestriction || isSubmitting) return;

    const numericGrade = parseFloat(gradeStr);
    if (isNaN(numericGrade) || numericGrade < 1 || numericGrade > 10) {
      alert('Por favor ingresa un promedio general válido de la UTB (entre 1.00 y 10.00).');
      return;
    }

    if (!verifiedGuarantor) {
      alert('Por favor verifica y valida a tu garante solidario antes de continuar.');
      return;
    }

    if (!confirmed) {
      alert('Debes confirmar el compromiso solidario de abono en los días lunes.');
      return;
    }

    await onApply(amount, weeks, numericGrade, verifiedGuarantor);
  };

  const firstDateStr = calculation.schedule[0]?.dueDate ? calculation.schedule[0].dueDate.toISOString().split('T')[0] : '---';

  return (
    <div className="space-y-8 bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs transition-colors duration-300 font-sans">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Simulador y Calculadora Oficial de Créditos
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Tasa institucional del 8.5% anual • Cuotas semanales fijas de Lunes a Lunes con semana de gracia inicial.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Cobros Lunes a Lunes</span>
        </div>
      </div>

      {/* Candado Anti-Sobreendeudamiento */}
      {activeRestriction && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Restricción Preventiva del Fondo</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{activeRestriction}</p>
          </div>
        </div>
      )}

      {/* PASO 1: SELECCIÓN DE MONTO */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
          Paso 1: Selecciona el cupo en USD
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ALLOWED_AMOUNTS.map((item) => {
            const isSelected = amount === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setAmount(item.value)}
                className={`text-left p-5 rounded-xl border transition shadow-xs ${
                  isSelected
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-semibold uppercase ${
                    isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
                  }`}>
                    {item.tag}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${item.value} <span className="text-xs font-normal text-slate-500">USD</span>
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 2: SELECCIÓN DE PLAZO */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Paso 2: Plazo de repago semanal (Lunes)
          </label>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Plazo seleccionado: {weeks} Semanas
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {ALLOWED_WEEKS.map((w) => {
            const isSelected = weeks === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setWeeks(w)}
                className={`py-2.5 px-3 rounded-lg text-center font-medium text-sm transition border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {w} <span className="text-xs">semanas</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 3: REQUISITOS ACADÉMICOS Y GARANTE */}
      <div className="p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Paso 3: Promedio académico y verificación del garante solidario
          </h4>
        </div>
        
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Ingresa tu promedio del semestre anterior y verifica la cédula o correo institucional de tu compañero garante en la UTB. <br />
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Regla institucional para 1er Semestre:</span> Si eres estudiante de primer semestre, tu garante debe cursar obligatoriamenente el 2do semestre o superior.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="grade" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Promedio del semestre anterior (ej. 8.50)
            </label>
            <input
              type="number"
              id="grade"
              step="0.01"
              min="1.00"
              max="10.00"
              value={gradeStr}
              onChange={(e) => setGradeStr(e.target.value)}
              disabled={!!activeRestriction}
              placeholder="Ej. 8.50"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1422] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition disabled:opacity-50 shadow-xs"
            />
          </div>

          <div>
            <label htmlFor="guarantor" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cédula o Correo del Garante Solidario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="guarantor"
                value={guarantorIdInput}
                onChange={(e) => {
                  setGuarantorIdInput(e.target.value);
                  setVerifiedGuarantor(null);
                }}
                disabled={!!activeRestriction || isVerifyingGuarantor}
                placeholder="Cédula o correo@utb.edu.ec"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1422] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition disabled:opacity-50 shadow-xs"
              />
              
              <button
                type="button"
                onClick={handleVerifyGuarantor}
                disabled={!!activeRestriction || isVerifyingGuarantor || !guarantorIdInput.trim()}
                className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingGuarantor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Verificar</span>
              </button>
            </div>
          </div>
        </div>

        {guarantorError && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{guarantorError}</span>
          </div>
        )}

        {verifiedGuarantor && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-700 text-white">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{verifiedGuarantor.fullName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {verifiedGuarantor.faculty} • <b>{verifiedGuarantor.semester}º Semestre</b>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold text-[11px] shrink-0">
              Garante Aprobado
            </span>
          </div>
        )}
      </div>

      {/* TARJETA DE RESUMEN FINANCIERO EN VIVO */}
      <div className="p-6 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase">Cuota semanal (Cw)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">${calculation.weeklyPaymentAmount.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ semana</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Repagos cada lunes</p>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
          <p className="text-xs text-slate-400 font-medium uppercase">Interés institucional</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-white">${calculation.totalInterest.toFixed(2)}</span>
            <span className="text-xs text-emerald-400 font-medium">(8.5% Anual)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sin costos de apertura</p>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
          <p className="text-xs text-slate-400 font-medium uppercase">Total a devolver</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-white">${calculation.totalRepayment.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Capital ($ {amount}) + Interés</p>
        </div>

        <div className="border-t sm:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
          <p className="text-xs text-slate-400 font-medium uppercase">Primer Lunes de cobro</p>
          <div className="flex items-center gap-1.5 mt-1 text-white">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-base font-bold">{firstDateStr}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">+7 días de gracia inicial</p>
        </div>
      </div>

      {/* Cronograma Oficial Lunes a Lunes */}
      <div>
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 transition"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Ver cronograma oficial de las {weeks} cuotas de Lunes
          </span>
          {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSchedule && (
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 font-semibold">
                <tr>
                  <th className="py-2.5 px-4"># Cuota</th>
                  <th className="py-2.5 px-4">Fecha de Lunes</th>
                  <th className="py-2.5 px-4">Capital</th>
                  <th className="py-2.5 px-4">Interés</th>
                  <th className="py-2.5 px-4 text-emerald-700 dark:text-emerald-400">Cuota (Cw)</th>
                  <th className="py-2.5 px-4 text-right">Saldo Restante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {calculation.schedule.map((row) => (
                  <tr key={row.installmentNumber} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="py-2 px-4 font-semibold">Semana {row.installmentNumber}</td>
                    <td className="py-2 px-4 font-medium">{row.dueDate.toISOString().split('T')[0]}</td>
                    <td className="py-2 px-4">${row.principal.toFixed(2)}</td>
                    <td className="py-2 px-4">${row.interest.toFixed(4)}</td>
                    <td className="py-2 px-4 font-bold text-emerald-700 dark:text-emerald-400">${row.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">${row.remainingBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Envío y Confirmación */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="terms"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={!!activeRestriction}
            className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 cursor-pointer disabled:opacity-50"
          />
          <label htmlFor="terms" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-relaxed">
            Confirmo mi solicitud de <b>${amount} USD a {weeks} semanas</b>. Declaro la veracidad de mi promedio y acepto el compromiso solidario con la comunidad de la UTB para efectuar el abono de <b>${calculation.weeklyPaymentAmount.toFixed(2)} cada Lunes</b>. Comprendo que ante retrasos superiores a dos semanas, el saldo impago será informado y registrado en el portal de mi garante <b>{verifiedGuarantor?.fullName || 'validado'}</b>.
          </label>
        </div>

        <button
          type="submit"
          disabled={!confirmed || !verifiedGuarantor || isSubmitting || !!activeRestriction}
          className="w-full h-12 px-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin text-white" /> Procesando solicitud estudiantil...</>
          ) : (
            <><ShieldCheck className="w-5 h-5" /> Enviar Solicitud Oficial por ${amount} USD Ahora</>
          )}
        </button>
      </form>
    </div>
  );
}
