'use client';

import React, { useState, useMemo } from 'react';
import { generateAmortizationSchedule } from '../../lib/financial/amortization';
import { verifyGuarantorEligibility, type VerifiedGuarantor } from '../../lib/firebase/loans';
import { 
  DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2, 
  ChevronDown, ChevronUp, Loader2, ShieldCheck, UserCheck, Search, 
  BookOpen, GraduationCap, FileText, Upload, Trash2, Check, ArrowRight, ArrowLeft, Shield, Clock
} from 'lucide-react';

interface CreditSimulatorProps {
  onApply: (
    amount: number, 
    weeks: number, 
    grade: number, 
    guarantor: VerifiedGuarantor,
    certificateUrl?: string,
    certificateFileName?: string
  ) => Promise<void>;
  isSubmitting: boolean;
  activeRestriction?: string | null;
  applicantUid: string;
  applicantSemester: number;
  userFaculty?: string;
  userCareer?: string;
}

type StepId = 1 | 2 | 3 | 4 | 5;

export default function CreditSimulator({ 
  onApply, isSubmitting, activeRestriction, applicantUid, applicantSemester,
  userFaculty = 'Universidad Técnica de Babahoyo', userCareer = 'Especialidad Universitaria'
}: CreditSimulatorProps) {
  // Wizard step state
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Step 1: Academic info & document
  const [faculty, setFaculty] = useState<string>(userFaculty);
  const [career, setCareer] = useState<string>(userCareer);
  const [semester, setSemester] = useState<number>(applicantSemester || 1);
  const [section, setSection] = useState<string>('Matutina');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateDataUrl, setCertificateDataUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 2: Amount
  const [amount, setAmount] = useState<number>(15);

  // Step 3: Term & Schedule
  const [weeks, setWeeks] = useState<number>(4);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Step 4: Guarantor
  const [guarantorIdInput, setGuarantorIdInput] = useState<string>('');
  const [verifiedGuarantor, setVerifiedGuarantor] = useState<VerifiedGuarantor | null>(null);
  const [isVerifyingGuarantor, setIsVerifyingGuarantor] = useState<boolean>(false);
  const [guarantorError, setGuarantorError] = useState<string | null>(null);

  // Step 5: Confirm
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Financial calculation
  const calculation = useMemo(() => {
    return generateAmortizationSchedule(amount, weeks, new Date());
  }, [amount, weeks]);

  const firstDateStr = calculation.schedule[0]?.dueDate ? calculation.schedule[0].dueDate.toISOString().split('T')[0] : '---';
  const lastDateStr = calculation.schedule[calculation.schedule.length - 1]?.dueDate ? calculation.schedule[calculation.schedule.length - 1].dueDate.toISOString().split('T')[0] : '---';

  /* ── File Upload Handler (Soporte hasta 2.5 MB) ─────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo (PDF o Imagen)
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setUploadError('Por favor sube un archivo en formato PDF o Imagen (PNG, JPG).');
      return;
    }

    // Validar tamaño (máximo 2.5 MB)
    if (file.size > 2.5 * 1024 * 1024) {
      setUploadError('El archivo excede el tamaño máximo permitido de 2.5 MB. Por favor comprime el PDF o intenta con un archivo más liviano.');
      return;
    }

    setCertificateFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCertificateDataUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setCertificateFile(null);
    setCertificateDataUrl('');
    setUploadError(null);
  };

  /* ── Guarantor Verification Handler ─────────────────────────── */
  const handleVerifyGuarantor = async () => {
    if (!guarantorIdInput.trim()) {
      setGuarantorError('Por favor ingresa la Cédula o Correo Institucional de tu compañero.');
      return;
    }
    setIsVerifyingGuarantor(true);
    setGuarantorError(null);
    setVerifiedGuarantor(null);

    const result = await verifyGuarantorEligibility(applicantUid, semester, guarantorIdInput);
    setIsVerifyingGuarantor(false);

    if (result.valid && result.guarantor) {
      setVerifiedGuarantor(result.guarantor);
    } else {
      setGuarantorError(result.error || 'No se pudo validar al compañero garante en el registro.');
    }
  };

  /* ── Step Navigation & Validation ───────────────────────────── */
  const handleNextFromStep1 = () => {
    if (!certificateDataUrl) {
      alert('El Certificado o Promoción de Notas en PDF o imagen es OBLIGATORIO para verificar tus calificaciones e historial.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (amount < 10 || amount > 30) {
      alert('El monto solicitado debe estar en el rango institucional de $10.00 a $30.00 USD.');
      return;
    }
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
  };

  const handleNextFromStep4 = () => {
    if (!verifiedGuarantor) {
      alert('Debes verificar y validar exitosamente a tu garante solidario antes de continuar al resumen.');
      return;
    }
    setCurrentStep(5);
  };

  /* ── Final Submission ───────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRestriction || isSubmitting) return;

    if (!verifiedGuarantor || !confirmed || !certificateDataUrl) {
      alert('Por favor verifica que todos los pasos y el archivo adjunto estén listos y confirmados.');
      return;
    }

    // Pasamos 0 como promedio ya que la revisión académica se realiza directamente sobre el PDF por la Secretaría
    await onApply(amount, weeks, 0, verifiedGuarantor, certificateDataUrl, certificateFile?.name || 'promocion_notas_utb.pdf');
  };

  const stepsList = [
    { num: 1 as StepId, label: 'Académico', desc: 'Carrera y certificado' },
    { num: 2 as StepId, label: 'Monto',     desc: '$10 - $30 USD' },
    { num: 3 as StepId, label: 'Plazo',     desc: 'Semanas de repago' },
    { num: 4 as StepId, label: 'Garante',   desc: 'Respaldos y validación' },
    { num: 5 as StepId, label: 'Resumen',   desc: 'Envío oficial' },
  ];

  return (
    <div className="space-y-8 animate-fadein font-sans">
      
      {/* Encabezado del Proceso */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2 inline-block">
            Proceso Cooperativo 2026
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Solicitar Microcrédito
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Completa los 5 pasos para adjuntar tu promoción de notas y enviar tu solicitud de crédito institucional.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Tiempo estimado: <b>2 minutos</b></span>
        </div>
      </div>

      {/* Candado Anti-Sobreendeudamiento */}
      {activeRestriction && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3.5 shadow-sm">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-base">Restricción Preventiva del Fondo UTB</p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{activeRestriction}</p>
          </div>
        </div>
      )}

      {/* ── BARRA SUPERIOR DE PROGRESO POR PASOS (WIZARD) ──────────────── */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {stepsList.map((step) => {
          const isPassed = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <button
              key={step.num}
              type="button"
              disabled={!!activeRestriction || (step.num > currentStep && step.num - currentStep > 1)}
              onClick={() => setCurrentStep(step.num)}
              className={`flex flex-col items-center sm:items-start p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 ${
                isCurrent
                  ? 'bg-white dark:bg-[#111A2E] shadow-md ring-1 ring-emerald-500/50 scale-[1.02]'
                  : isPassed
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'opacity-60 hover:opacity-100 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center transition-colors ${
                  isCurrent ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : isPassed ? 'bg-emerald-700 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {isPassed ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : step.num}
                </span>
                {isPassed && <span className="hidden sm:inline text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Listo</span>}
              </div>
              <p className={`text-xs sm:text-sm font-extrabold truncate w-full ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {step.label}
              </p>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
                {step.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── CONTENEDOR PRINCIPAL: PANEL IZQUIERDA + VISTA PREVIA DERECHA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL DE FORMULARIO WIZARD (IZQUIERDA) */}
        <div className="lg:col-span-7 space-y-6 bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
          
          {/* PASO 1: INFORMACIÓN ACADÉMICA Y DOCUMENTO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadein">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paso 1 de 5</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Información académica y certificado</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Actualiza o confirma tu información académica actual y adjunta el documento con tus calificaciones.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Facultad *</label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    disabled={!!activeRestriction}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0A0E1A] text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Carrera *</label>
                  <input
                    type="text"
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    disabled={!!activeRestriction}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0A0E1A] text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Semestre que cursas *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    disabled={!!activeRestriction}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <option key={s} value={s}>{s}º Semestre {s === 1 ? '(Requiere garante de 2do sm.)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sección *</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    disabled={!!activeRestriction}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none transition cursor-pointer"
                  >
                    <option value="Matutina">Matutina</option>
                    <option value="Vespertina">Vespertina</option>
                    <option value="Nocturna">Nocturna</option>
                    <option value="Virtual / Distancia">Virtual / Distancia</option>
                  </select>
                </div>
              </div>

              {/* CERTIFICADO / PROMOCIÓN DE NOTAS (UPLOAD HASTA 2.5 MB) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A0E1A] border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    Promoción / Certificado de Notas (Obligatorio) *
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 w-fit">
                    PDF o JPG/PNG (Hasta 2.5 MB)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sube el archivo PDF o la imagen de tu promoción de notas (SIU / secretaría) para que el Administrador valide tus calificaciones directamente desde tu documento.
                </p>

                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {!certificateDataUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-xl cursor-pointer bg-white/50 dark:bg-slate-900/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="mb-1 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Haz clic para seleccionar archivo</span> o arrástralo aquí
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">Formato admitido: PDF, JPG, PNG (Peso máximo: 2.5 MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} disabled={!!activeRestriction} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 animate-fadein">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white">
                          {certificateFile?.name || 'documento_notas_utb.pdf'}
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          ✓ Archivo adjuntado y listo para verificación académica
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={!!activeRestriction}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                      title="Eliminar y seleccionar otro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  disabled={!!activeRestriction || !certificateDataUrl}
                  className="px-7 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Siguiente paso: Monto</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIÓN DE MONTO */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadein">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paso 2 de 5</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Monto a solicitar</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Elige cuánto capital necesitas para cubrir tus gastos universitarios esta semana.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Selecciona una cantidad de la lista rápida o escribe el monto exacto:
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 30].map((preset) => {
                    const active = amount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        disabled={!!activeRestriction}
                        className={`h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                          active
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                        }`}
                      >
                        <span>${preset}.00</span>
                        <span className="text-[10px] font-normal text-slate-400">USD</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label htmlFor="custom-amount" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Monto personalizado (Mínimo $10 — Máximo $30 USD):
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                    <input
                      id="custom-amount"
                      type="number"
                      min="10"
                      max="30"
                      step="1"
                      value={amount || ''}
                      disabled={!!activeRestriction}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAmount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-12 pl-9 pr-12 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-white font-extrabold text-lg focus:outline-none focus:border-emerald-600 transition text-right"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">USD</span>
                  </div>
                </div>

                {(amount < 10 || amount > 30) && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 font-medium">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Por favor selecciona un monto dentro del rango institucional permitido ($10 a $30 USD).</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  disabled={!!activeRestriction || amount < 10 || amount > 30}
                  className="px-7 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <span>Siguiente paso: Plazo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: SELECCIÓN DE PLAZO Y CRONOGRAMA */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadein">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paso 3 de 5</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plazo de repago semanal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona en cuántos lunes hábiles deseas distribuir el retorno de tu crédito.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { w: 1, label: '1 semana', desc: '1 cuota única el próximo lunes' },
                  { w: 2, label: '2 semanas', desc: '15 días (2 cuotas semanales)' },
                  { w: 4, label: '4 semanas', desc: '1 mes (4 cuotas semanales)' },
                  { w: 8, label: '8 semanas', desc: '2 meses (8 cuotas semanales)' },
                ].map((term) => {
                  const active = weeks === term.w;
                  return (
                    <button
                      key={term.w}
                      type="button"
                      onClick={() => setWeeks(term.w)}
                      disabled={!!activeRestriction}
                      className={`p-4 rounded-2xl text-left border-2 transition-all duration-200 flex flex-col justify-between ${
                        active
                          ? 'bg-emerald-500/15 text-slate-900 dark:text-white border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-[#0A0E1A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-base font-extrabold">{term.label}</span>
                        {active && <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{term.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Toggle para ver tabla cronograma oficial */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Ver cronograma oficial de las {weeks} cuotas semanales ({firstDateStr} al {lastDateStr})
                  </span>
                  {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showSchedule && (
                  <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080C16] max-h-56 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 font-bold">
                        <tr>
                          <th className="py-2.5 px-4"># Cuota</th>
                          <th className="py-2.5 px-4">Vencimiento</th>
                          <th className="py-2.5 px-4">Capital</th>
                          <th className="py-2.5 px-4">Interés</th>
                          <th className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">Cuota (Cw)</th>
                          <th className="py-2.5 px-4 text-right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {calculation.schedule.map((row) => (
                          <tr key={row.installmentNumber} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                            <td className="py-2 px-4 font-bold">Semana {row.installmentNumber}</td>
                            <td className="py-2 px-4">{row.dueDate.toISOString().split('T')[0]}</td>
                            <td className="py-2 px-4">${row.principal.toFixed(2)}</td>
                            <td className="py-2 px-4">${row.interest.toFixed(4)}</td>
                            <td className="py-2 px-4 font-extrabold text-emerald-700 dark:text-emerald-400">${row.amount.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right font-mono text-slate-500">${row.remainingBalance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  disabled={!!activeRestriction}
                  className="px-7 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition"
                >
                  <span>Siguiente paso: Garante</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: VERIFICACIÓN DEL GARANTE SOLIDARIO */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadein">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paso 4 de 5</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verificación de Garante Solidario</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Elige a un compañero de la UTB para respaldar cooperativamente tu solicitud.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Regla institucional para novatos:
                </p>
                <p>
                  Si te encuentras cursando el 1er semestre, tu compañero garante debe cursar obligatoriamente el <b>2do semestre en adelante</b> en cualquier carrera de la universidad.
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="guarantor-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cédula o Correo del Garante (compañero registrado):
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    id="guarantor-input"
                    value={guarantorIdInput}
                    onChange={(e) => {
                      setGuarantorIdInput(e.target.value);
                      setVerifiedGuarantor(null);
                    }}
                    disabled={!!activeRestriction || isVerifyingGuarantor}
                    placeholder="Ej: 1208932145 o compañero@utb.edu.ec"
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition shadow-xs"
                  />
                  
                  <button
                    type="button"
                    onClick={handleVerifyGuarantor}
                    disabled={!!activeRestriction || isVerifyingGuarantor || !guarantorIdInput.trim()}
                    className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition shrink-0 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingGuarantor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Verificar en Nube</span>
                  </button>
                </div>
              </div>

              {guarantorError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-3 font-semibold animate-fadein">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{guarantorError}</span>
                </div>
              )}

              {verifiedGuarantor && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-slate-900 dark:text-white text-xs sm:text-sm flex items-center justify-between gap-4 animate-fadein shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-base text-slate-900 dark:text-white">{verifiedGuarantor.fullName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {verifiedGuarantor.faculty} • <span className="font-bold text-emerald-600 dark:text-emerald-400">{verifiedGuarantor.semester}º Semestre</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{verifiedGuarantor.cedula || verifiedGuarantor.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs shrink-0 shadow-xs uppercase tracking-wider">
                    ✓ Garante Válido
                  </span>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep4}
                  disabled={!!activeRestriction || !verifiedGuarantor}
                  className="px-7 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <span>Ver Resumen Final</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 5: RESUMEN Y ENVÍO */}
          {currentStep === 5 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fadein">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paso 5 — Resumen Final</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirma y envía tu solicitud</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verifica que todos los datos y documentos estén correctos antes de transmitir tu expediente al Admin.</p>
              </div>

              {/* Tabla de comprobación */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide border-b pb-2 border-slate-200 dark:border-slate-800">
                  Resumen de tu Expediente
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Facultad / Carrera</span>
                    <strong className="text-slate-900 dark:text-white block truncate">{career}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Promoción de Notas</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1 font-bold">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" /> {certificateFile?.name || 'Promocion_notas.pdf'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Monto Solicitado</span>
                    <strong className="text-slate-900 dark:text-white font-black text-base">${amount}.00 USD</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Plazo pactado</span>
                    <strong className="text-slate-900 dark:text-white">{weeks} semanas ({weeks} cuotas)</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <span className="text-slate-500 block text-xs">Garante solidario verificado</span>
                    <strong className="text-slate-900 dark:text-white truncate block font-bold">{verifiedGuarantor?.fullName} ({verifiedGuarantor?.semester}º Semestre)</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30">
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={!!activeRestriction || isSubmitting}
                  className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 cursor-pointer disabled:opacity-50"
                />
                <label htmlFor="terms-check" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-relaxed">
                  Confirmo mi solicitud de <b>${amount} USD a {weeks} semanas</b>. Declaro bajo responsabilidad estudiantil la autenticidad del archivo de notas adjunto para la revisión del Administrador y acepto el compromiso solidario para abonar las <b>${calculation.weeklyPaymentAmount.toFixed(2)} USD semanales</b> según el cronograma.
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={isSubmitting}
                  className="px-5 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={!confirmed || !verifiedGuarantor || isSubmitting || !certificateDataUrl || !!activeRestriction}
                  className="flex-1 max-w-md h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin text-white" /> Transmitiendo al Administrador...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Enviar Solicitud Oficial al Fondo</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── COLUMNA DERECHA: TARJETA VISTA PREVIA DEL CRÉDITO (FIJA) ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F8B6D] via-[#0b6650] to-[#0A4D3B] text-white p-6 sm:p-8 shadow-2xl border border-emerald-400/30 transition-all duration-300">
            
            {/* Ambient glow decoration */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-200">
                  VISTA PREVIA DEL CRÉDITO
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>

              <div className="text-right pb-2">
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">Monto solicitado</p>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 tabular-nums font-mono">
                  ${amount.toFixed(2)}
                  <span className="text-sm font-normal text-emerald-200 ml-1.5">USD</span>
                </p>
              </div>

              {/* Lista de desglose */}
              <div className="space-y-3.5 border-t border-b border-white/15 py-5 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Plazo pactado</span>
                  <span className="font-bold text-white">{weeks} {weeks === 1 ? 'semana' : 'semanas'} ({weeks} cuotas)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Tasa solidaria</span>
                  <span className="font-bold text-emerald-200">8.50% Anual (Fondo UTB)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Interés institucional</span>
                  <span className="font-bold text-white">${calculation.totalInterest.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white font-bold">Cuota Semanal (Cw)</span>
                  <span className="text-lg font-black text-emerald-200 font-mono">${calculation.weeklyPaymentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-extrabold">Total a devolver</span>
                  <span className="text-base font-extrabold text-white font-mono">${calculation.totalRepayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-emerald-100">Fecha primer pago</span>
                  <span className="font-semibold text-white">{firstDateStr} (+7 días gracia)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Fecha límite (cierre)</span>
                  <span className="font-semibold text-white">{lastDateStr}</span>
                </div>
              </div>

              {/* Condiciones Institucionales */}
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  Condiciones y Ventajas UTB
                </p>
                <ul className="text-xs space-y-2 text-emerald-100">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">✓</span> Sin garantía colateral comercial ni bancaria
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">✓</span> Evaluación y aprobación en menos de 24 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">✓</span> Solo 1 microcrédito activo en simultáneo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">✓</span> Tasas 100% fijas, transparentes y sin comisiones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">✓</span> Respaldo solidario entre compañeros de la universidad
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
