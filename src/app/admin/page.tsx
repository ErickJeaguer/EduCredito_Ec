'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  subscribeToAllLoans, 
  adminApproveLoan, 
  adminRejectLoan 
} from '../../lib/firebase/loans';
import type { LoanApplication, LoanStatus } from '../../types/credit';
import { ThemeToggleButton } from '../../components/theme/ThemeProvider';
import { 
  ShieldCheck, Users, DollarSign, BarChart3, LogOut, Loader2, 
  CheckCircle2, XCircle, AlertCircle, Clock, FileText, ChevronRight, Filter, MessageSquare, Award
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { profile, authUser, loading, logout } = useAuth();
  const router = useRouter();

  const [allLoans, setAllLoans] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Estado para el Modal de Rechazo con Justificación
  const [rejectionModalLoan, setRejectionModalLoan] = useState<LoanApplication | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    if (!loading && !authUser && !profile) {
      router.replace('/login');
    }
  }, [authUser, profile, loading, router]);

  useEffect(() => {
    const unsubscribe = subscribeToAllLoans((loans) => {
      setAllLoans(loans);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Abriendo consola directiva de secretaría UTB...
          </p>
        </div>
      </div>
    );
  }

  // Filtrado de solicitudes
  const filteredLoans = allLoans.filter((loan) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return loan.status === 'pending';
    if (filterStatus === 'active') return loan.status === 'active' || loan.status === 'approved' || loan.status === 'overdue';
    if (filterStatus === 'rejected') return loan.status === 'rejected';
    return true;
  });

  // KPIs Administrativos
  const pendingCount = allLoans.filter(l => l.status === 'pending').length;
  const activeCount = allLoans.filter(l => ['active', 'approved', 'overdue'].includes(l.status)).length;
  const rejectedCount = allLoans.filter(l => l.status === 'rejected').length;
  const totalCapitalCometido = allLoans
    .filter(l => ['active', 'approved', 'overdue', 'pending'].includes(l.status))
    .reduce((sum, item) => sum + item.requestedAmount, 0);

  // Acción: Aprobar crédito
  const handleApprove = async (loan: LoanApplication) => {
    if (!loan.id) return;
    if (!confirm(`¿Estás seguro de APROBAR el crédito de $${loan.requestedAmount}.00 USD para el estudiante ${loan.studentName}?`)) return;

    setProcessingId(loan.id);
    const res = await adminApproveLoan(loan.id);
    setProcessingId(null);

    if (res.success) {
      alert(`✅ Crédito de ${loan.studentName} aprobado exitosamente. Se ha habilitado su cronograma de cobros semanales.`);
    } else {
      alert(`Error al aprobar: ${res.error}`);
    }
  };

  // Acción: Abrir modal de rechazo
  const openRejectionModal = (loan: LoanApplication) => {
    setRejectionModalLoan(loan);
    setRejectionReasonInput('');
    setSelectedPreset('');
  };

  // Acción: Confirmar rechazo con mensaje obligatorio
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalLoan || !rejectionModalLoan.id) return;

    const finalMessage = selectedPreset && selectedPreset !== 'custom'
      ? `${selectedPreset}. ${rejectionReasonInput}`.trim()
      : rejectionReasonInput.trim();

    if (!finalMessage) {
      alert('⚠️ Por favor ingresa el motivo oficial de rechazo para notificar con claridad al estudiante.');
      return;
    }

    setProcessingId(rejectionModalLoan.id);
    const res = await adminRejectLoan(rejectionModalLoan.id, finalMessage);
    setProcessingId(null);

    if (res.success) {
      alert(`❌ Solicitud rechazada correctamente. Se notificó al estudiante con el motivo: "${finalMessage}".`);
      setRejectionModalLoan(null);
    } else {
      alert(`Error al rechazar: ${res.error}`);
    }
  };

  const presetReasons = [
    'El promedio general declarado del semestre pasado no coincide con los archivos oficiales de secretaría UTB',
    'El garante solidario propuesto mantiene cuotas pendientes o en mora en la plataforma',
    'El garante de un estudiante de primer semestre debe cursar obligatoriamente el segundo semestre o posterior',
    'El historial crediticio del estudiante en el fondo registra retrasos recurrentes no subsanados',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans">
      
      {/* CABECERA DIRECTIVA BANcaria */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800">
                Consola Directiva UTB
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Secretaría y Control del Fondo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <button
              onClick={() => logout().then(() => router.push('/login'))}
              className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">Salir del Portal Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* BANNER DE BIENVENIDA DIRECTIVA */}
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Estación de Revisión y Dictamen Crediticio
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gestión de Solicitudes y Expedientes
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sesión activa: <b>{authUser?.email || 'Administrador UTB'}</b> • Verifica notas semestrales y elegibilidad solidaria de garantes antes de emitir un dictamen.
            </p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs shrink-0 font-medium">
            <p className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Motor de Scoring Calibrado
            </p>
            <p className="mt-0.5 opacity-90">Rango permitido: $10 a $30 USD</p>
          </div>
        </div>

        {/* TARJETAS DE KPIS BANcarios */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">En Cola de Revisión</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</span>
              <Clock className="w-6 h-6 text-amber-500 opacity-60" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Requieren dictamen oficial</p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Créditos en Operación</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</span>
              <DollarSign className="w-6 h-6 text-emerald-500 opacity-60" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Desembolsados y activos</p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Trámites Devueltos</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{rejectedCount}</span>
              <XCircle className="w-6 h-6 text-rose-500 opacity-60" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Con retroalimentación enviada</p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Capital Rotativo Activo</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${totalCapitalCometido}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">USD</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Monto global comprometido</p>
          </div>
        </div>

        {/* NAVEGACIÓN Y FILTROS DE MESA DE REVISIÓN */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mesa de Evaluación de Créditos</h3>
            </div>

            <div className="flex overflow-x-auto gap-1 text-xs font-medium">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`py-2 px-3.5 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Pendientes por revisar</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 font-bold">{pendingCount}</span>
              </button>

              <button
                onClick={() => setFilterStatus('active')}
                className={`py-2 px-3.5 rounded-lg transition shrink-0 ${
                  filterStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Activos / En Curso ({activeCount})
              </button>

              <button
                onClick={() => setFilterStatus('rejected')}
                className={`py-2 px-3.5 rounded-lg transition shrink-0 ${
                  filterStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 font-bold border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rechazados ({rejectedCount})
              </button>

              <button
                onClick={() => setFilterStatus('all')}
                className={`py-2 px-3.5 rounded-lg transition shrink-0 ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({allLoans.length})
              </button>
            </div>
          </div>

          {/* LISTADO DE SOLicituDES */}
          {filteredLoans.length === 0 ? (
            <div className="p-16 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <FileText className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">No hay solicitudes para mostrar en esta vista</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No se encontraron trámites con el filtro seleccionado ({filterStatus.toUpperCase()}). Selecciona otra categoría en las pestañas superiores.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => {
                const isProcessing = processingId === loan.id;
                const isNovato = loan.semester === 1;
                const garanteValidoSemestres = !isNovato || (loan.guarantorSemester && loan.guarantorSemester >= 2);

                return (
                  <div 
                    key={loan.id} 
                    className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700 space-y-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* DATOS DEL ESTUDIANTE Y SOLICITUD */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            REF: {loan.id?.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            loan.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            loan.status === 'pending' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' :
                            loan.status === 'rejected' ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 font-bold' :
                            loan.status === 'overdue' ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200 font-extrabold' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {loan.status === 'pending' ? '○ Pendiente de Verificación Directiva' :
                             loan.status === 'active' ? '● Desembolsado y en curso' :
                             loan.status === 'rejected' ? '✕ Devuelto / Rechazado con Motivo' :
                             loan.status === 'overdue' ? '⚠️ En Mora (Reportado)' :
                             '✓ Liquidado'}
                          </span>
                          <span className="text-xs text-slate-400">
                            Fecha: {new Date(loan.createdAt || Date.now()).toLocaleDateString('es-EC')}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-3 pt-1">
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                            {loan.studentName}
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {loan.career} • {loan.semester || 1}º Semestre
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 pt-1">
                          <span>Cédula: <b>{loan.studentCedula || 'No registrada'}</b></span>
                          <span>Promedio anterior declarado: <b className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{loan.previousSemesterGrade || 'N/D'} / 10.00</b></span>
                        </div>
                      </div>

                      {/* DETALLE FINANCIERO */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-right shrink-0 min-w-44">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Monto Solicitado</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          ${loan.requestedAmount}.00 <span className="text-xs font-normal text-slate-500">USD</span>
                        </span>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                          Plazo: {loan.durationWeeks} semanas de repago
                        </p>
                      </div>
                    </div>

                    {/* EXPEDIENTE DE GARANTÍA Y COMPROMISO SOLIDARIO */}
                    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">
                            Garante Solidario Propuesto: {loan.guarantorName || 'No identificado'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Identificador (Cédula/Email): <b>{loan.guarantorCedula || 'N/A'}</b> • Cursa el <b>{loan.guarantorSemester || 2}º Semestre</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {garanteValidoSemestres ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Garante verificado conforme al reglamento
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> ¡Alerta! Novato con garante menor a 2º Semestre
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MOSTRAR MOTIVO SI ESTÁ RECHAZADO */}
                    {loan.status === 'rejected' && loan.rejectionReason && (
                      <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                        <MessageSquare className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-800 dark:text-rose-300 block">Dictamen de rechazo enviado al estudiante:</span>
                          <p className="mt-0.5 leading-relaxed">{loan.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {/* BOTONES DE DECISIÓN ADMINISTRATIVA (SOLO EN SOLICITUDES PENDIENTES) */}
                    {loan.status === 'pending' && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => openRejectionModal(loan)}
                          className="h-10 px-5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar y Notificar Motivo</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(loan)}
                          className="h-10 px-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>Aprobar y Desembolsar Crédito</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE JUSTIFICACIÓN DE RECHAZO */}
      {rejectionModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="max-w-xl w-full bg-white dark:bg-[#0E1422] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Rechazar Solicitud de {rejectionModalLoan.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monto solicitado: ${rejectionModalLoan.requestedAmount}.00 USD • REF: {rejectionModalLoan.id?.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalLoan(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  1. Elige una causa frecuente del reglamento (Opcional):
                </label>
                <div className="space-y-2">
                  {presetReasons.map((preset, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:border-slate-300 transition"
                    >
                      <input
                        type="radio"
                        name="preset-reason"
                        value={preset}
                        checked={selectedPreset === preset}
                        onChange={(e) => {
                          setSelectedPreset(e.target.value);
                          if (!rejectionReasonInput) setRejectionReasonInput(e.target.value);
                        }}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="preset-reason"
                      value="custom"
                      checked={selectedPreset === 'custom'}
                      onChange={() => {
                        setSelectedPreset('custom');
                        setRejectionReasonInput('');
                      }}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Redactar motivo personalizado o aclaraciones adicionales...</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="custom-reason" className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  2. Mensaje oficial que recibirá el estudiante en su portal:
                </label>
                <textarea
                  id="custom-reason"
                  rows={3}
                  required
                  placeholder="Explica clara y respetuosamente por qué no fue aprobada la solicitud y cómo el estudiante puede solucionarlo para postular nuevamente..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectionModalLoan(null)}
                  className="h-10 px-5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectionModalLoan.id || !rejectionReasonInput.trim()}
                  className="h-10 px-6 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {processingId === rejectionModalLoan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirmar Rechazo y Enviar Mensaje</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

