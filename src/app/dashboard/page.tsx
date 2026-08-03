'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import CreditSimulator from '../../components/simulator/CreditSimulator';
import { 
  subscribeToStudentLoans, 
  subscribeToGuaranteedDebts,
  createLoanRequest, 
  simulateInstallmentPayment,
  demoApproveLoan,
  demoSimulateOverdue,
  type VerifiedGuarantor 
} from '../../lib/firebase/loans';
import type { LoanApplication } from '../../types/credit';
import { ThemeToggleButton } from '../../components/theme/ThemeProvider';
import { 
  GraduationCap, LogOut, Wallet, Clock, AlertTriangle, 
  ChevronRight, FileText, Loader2, DollarSign, Check, Play, UserCheck, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { profile, authUser, loading, logout } = useAuth();
  const router = useRouter();
  
  const user = profile || (authUser ? {
    uid: authUser.uid,
    fullName: authUser.displayName || authUser.email?.split('@')[0] || 'Estudiante UTB',
    email: authUser.email || '',
    cedula: '',
    faculty: 'Universidad Técnica de Babahoyo',
    career: 'Especialidad Universitaria',
    semester: 1,
    phone: '',
    role: 'student' as const
  } : null);
  
  const [activeTab, setActiveTab] = useState<'summary' | 'simulator' | 'loans' | 'guaranteed'>('summary');
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [guaranteedDebts, setGuaranteedDebts] = useState<LoanApplication[]>([]);
  const [activeRestriction, setActiveRestriction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authUser && !profile) {
      router.replace('/login');
    }
  }, [authUser, profile, loading, router]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeLoans = subscribeToStudentLoans(user.uid, (loans) => {
      setMyLoans(loans);
      
      const pending = loans.find(l => l.status === 'pending');
      const active = loans.find(l => l.status === 'approved' || l.status === 'active' || l.status === 'overdue');

      if (pending) {
        setActiveRestriction('Posees una solicitud de microcrédito actualmente en revisión por la secretaría administrativa de la UTB.');
      } else if (active) {
        setActiveRestriction('Tienes un microcrédito activo en curso. Debes completar las cuotas semanales antes de solicitar un nuevo monto.');
      } else {
        setActiveRestriction(null);
      }
    });

    const unsubscribeGuaranteed = subscribeToGuaranteedDebts(user.uid, (debts) => {
      setGuaranteedDebts(debts);
    });

    return () => {
      unsubscribeLoans();
      unsubscribeGuaranteed();
    };
  }, [user?.uid]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Cargando expediente estudiantil y cuotas...
          </p>
        </div>
      </div>
    );
  }

  const handleApplyLoan = async (amount: number, weeks: number, grade: number, guarantor: VerifiedGuarantor) => {
    if (!user) return;
    setIsSubmitting(true);
    const result = await createLoanRequest(user, amount, weeks, grade, guarantor);
    setIsSubmitting(false);

    if (result.success) {
      alert(`Solicitud por $${amount} USD ingresada correctamente. Garante verificado: ${guarantor.fullName}.`);
      setActiveTab('loans');
    } else {
      alert(`No se pudo procesar tu trámite: ${result.error}`);
    }
  };

  const handleSimulatePayment = async (loanId: string, index: number) => {
    const res = await simulateInstallmentPayment(loanId, index);
    if (res.success) {
      alert('Abono de cuota semanal de lunes registrado.');
    } else {
      alert('Error al simular pago: ' + res.error);
    }
  };

  const handleDemoApprove = async (loanId: string) => {
    await demoApproveLoan(loanId);
    alert('Modo Demo: Préstamo aprobado de inmediato por secretaría simulada.');
  };

  const handleDemoOverdue = async (loanId: string) => {
    await demoSimulateOverdue(loanId);
    alert('Modo Demo: Préstamo cambiado a estado de MORA (se notificará y registrará en el perfil de su Garante Solidario).');
  };

  const totalCreditos = myLoans.length;
  const creditoActivo = myLoans.find(l => ['active', 'approved', 'overdue'].includes(l.status));
  const saldoPendiente = creditoActivo 
    ? creditoActivo.installments.reduce((acc, curr) => !curr.isPaid ? acc + curr.amount : acc, 0)
    : 0;
  
  const proximoLunesVencimiento = creditoActivo?.installments.find(i => !i.isPaid)?.dueDate || 'Sin cobros en cola';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans">
      
      {/* CABECERA CORPORATIVA Y SOBRIA */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">EduCrédito UTB</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {user.fullName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <button
              onClick={() => logout()}
              className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* ALERTA DE DEUDAS GARANTIZadas EN MORA */}
        {guaranteedDebts.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  Notificación de Compromiso Solidario
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Tienes {guaranteedDebts.length} deuda(s) en mora como Garante Solidario
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  El estudiante <b>{guaranteedDebts[0].studentName}</b> ha acumulado retrasos en sus cuotas semanales de los lunes. Revisa tus responsabilidades en la sección de garantías para prevenir restricciones en el fondo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('guaranteed')}
              className="h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition"
            >
              Revisar garantías ({guaranteedDebts.length})
            </button>
          </div>
        )}

        {/* ALERTA DE SOLICITUD RECHAZADA POR ADMINISTRATORIA */}
        {myLoans.filter(l => l.status === 'rejected').map(rej => (
          <div key={rej.id} className="p-4 sm:p-5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 block">
                  Dictamen de la Secretaría Administrativa de Créditos
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Tu solicitud de microcrédito por ${rej.requestedAmount}.00 USD no ha sido aprobada
                </p>
                <div className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-rose-700 dark:text-rose-400">Motivo oficial devuelto por el administrador:</span>
                  <p className="mt-0.5 leading-relaxed font-medium">"{rej.rejectionReason || 'La documentación o garante no cumple temporalmente con los requisitos institucionales del fondo.'}"</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="h-9 px-4 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shrink-0 transition shadow-xs"
            >
              Corregir y postular de nuevo
            </button>
          </div>
        ))}

        {/* FICHA ACADÉMICA Y ESTADO */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Expediente de Matrícula • {user.faculty}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {user.career}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>Nivel: <b>{user.semester ? `${user.semester}º Semestre` : '1er Semestre'}</b></span>
              {user.cedula && <span>Cédula: <b>{user.cedula}</b></span>}
            </div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left sm:text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 block">Elegibilidad en Fondo</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-4 h-4" /> Apto para solicitar
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS BANCArias */}
        <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`py-2.5 px-4 rounded-lg transition shrink-0 ${
              activeTab === 'summary'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resumen general
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`py-2.5 px-4 rounded-lg transition shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Simular y solicitar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`py-2.5 px-4 rounded-lg transition shrink-0 ${
              activeTab === 'loans'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mis préstamos ({totalCreditos})
          </button>

          {guaranteedDebts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('guaranteed')}
              className={`py-2.5 px-4 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'guaranteed'
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-800'
                  : 'text-red-600 dark:text-red-400 hover:text-red-700'
              }`}
            >
              ⚠️ Deudas que garantizo ({guaranteedDebts.length})
            </button>
          )}
        </div>

        {/* TAB 1: RESUMEN GENERAL (KPIs Bancarios y Sobrios) */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cupo máximo habilitado</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {activeRestriction ? '$0.00' : '$30.00'} <span className="text-xs font-semibold text-slate-500">USD</span>
                  </p>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-4">
                  {activeRestriction ? 'Crédito en curso actualmente' : 'Rango disponible: $10.00 a $30.00 USD'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Deuda propia activa</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    ${saldoPendiente.toFixed(2)} <span className="text-xs font-semibold text-slate-500">USD</span>
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-4">
                  {creditoActivo ? `Crédito en curso a ${creditoActivo.durationWeeks} semanas` : 'Sin saldos pendientes'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Próximo Lunes de Repago</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-3 truncate">
                    {proximoLunesVencimiento}
                  </p>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-4">
                  {creditoActivo ? 'Recuerda tener tu cuota en secretaría' : 'Expediente al día'}
                </p>
              </div>

            </div>

            <div className="p-8 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Simulador Cooperativo en Tiempo Real
                </span>
                <h3 className="text-xl font-bold text-white">¿Necesitas materiales, software o viáticos académicos?</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Configura tu cuota semanal fija con la tasa solidaria del 8.5% anual y semana de gracia inicial.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('simulator')}
                className="h-11 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                Abrir simulador oficial <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULADOR */}
        {activeTab === 'simulator' && (
          <CreditSimulator
            onApply={handleApplyLoan}
            isSubmitting={isSubmitting}
            activeRestriction={activeRestriction}
            applicantUid={user.uid}
            applicantSemester={user.semester || 1}
          />
        )}

        {/* TAB 3: MIS PRÉSTamos */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Préstamos y Cuotas Semanales</h3>
            </div>

            {myLoans.length === 0 ? (
              <div className="p-12 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">Aún no tienes créditos en tu expediente</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Si requieres apoyo para libros o viáticos, puedes configurar tu primera solicitud en el simulador solidario.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                >
                  Ir al simulador de crédito
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myLoans.map((loan) => {
                  const pagadas = loan.installments.filter(i => i.isPaid).length;
                  const totalCuotas = loan.installments.length;
                  const porcentaje = Math.round((pagadas / totalCuotas) * 100);
                  const isSelected = selectedLoanForDetails === loan.id;

                  return (
                    <div
                      key={loan.id}
                      className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              REF: {loan.id?.slice(0, 8)}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                              loan.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              loan.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              loan.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold' :
                              loan.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {loan.status === 'active' ? '● Préstamo en curso (Cobros los lunes)' :
                               loan.status === 'pending' ? '○ En revisión administrativa' :
                               loan.status === 'rejected' ? '✕ Solicitud Devuelta / Rechazada' :
                               loan.status === 'overdue' ? '⚠️ En mora (Reportado a garante)' :
                               '✓ Liquidado / Pagado'}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            ${loan.requestedAmount}.00 USD <span className="text-xs font-normal text-slate-500">en {loan.durationWeeks} cuotas de Lunes</span>
                          </h4>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-left sm:text-right">
                          <p className="text-slate-500 uppercase font-semibold text-[10px]">Garante Solidario:</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {loan.guarantorName || 'No especificado'}
                          </p>
                          <p className="text-slate-500 mt-0.5 text-[11px]">Promedio reportado: <b>{loan.previousSemesterGrade || '---'}</b></p>
                        </div>
                      </div>

                      {/* Mensaje de rechazo dentro del historial de créditos */}
                      {loan.status === 'rejected' && loan.rejectionReason && (
                        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-800 dark:text-rose-300 block">Observación oficial de secretaría para esta solicitud:</span>
                            <p className="mt-0.5 leading-relaxed font-medium">{loan.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Progreso de Abonos */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                          <span>Progreso del crédito: {pagadas} de {totalCuotas} lunes abonados</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{porcentaje}% liquidado</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                        </div>
                      </div>

                      {/* BOTONES DE PRUEBAs (MODO DEMO PROTOTIPO) */}
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          Panel de simulación y pruebas en vivo:
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {loan.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleDemoApprove(loan.id!)}
                              className="h-8 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold transition flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Aprobar crédito
                            </button>
                          )}

                          {loan.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleDemoOverdue(loan.id!)}
                              className="h-8 px-3 rounded-md bg-red-700 hover:bg-red-800 text-white font-semibold transition flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Simular mora (Ver en garante)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedLoanForDetails(isSelected ? null : loan.id!)}
                            className="h-8 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold transition"
                          >
                            {isSelected ? 'Ocultar cronograma' : 'Ver cuotas semanales'}
                          </button>
                        </div>
                      </div>

                      {/* Tabla de Cuotas y Abono Simulado */}
                      {isSelected && (
                        <div className="pt-2 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                              <tr>
                                <th className="py-2.5 px-3">Cuota #</th>
                                <th className="py-2.5 px-3">Fecha (Lunes de repago)</th>
                                <th className="py-2.5 px-3">Monto semanal</th>
                                <th className="py-2.5 px-3">Estado del abono</th>
                                <th className="py-2.5 px-3 text-right">Acción en prototipo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                              {loan.installments.map((inst, idx) => (
                                <tr key={inst.weekNumber} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition ${inst.isPaid ? 'opacity-60' : ''}`}>
                                  <td className="py-2.5 px-3 font-semibold">Semana {inst.weekNumber}</td>
                                  <td className="py-2.5 px-3">{inst.dueDate}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${inst.amount.toFixed(2)}</td>
                                  <td className="py-2.5 px-3">
                                    {inst.isPaid ? (
                                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                        ✓ Liquidada
                                      </span>
                                    ) : (
                                      <span className="text-amber-700 dark:text-amber-400 font-medium">Pendiente de abono</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {!inst.isPaid ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSimulatePayment(loan.id!, idx)}
                                        className="h-7 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
                                      >
                                        Pagar cuota simular
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 font-mono text-[11px]">Pagada</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DEUDAS QUE GARANTIZO (En Mora > 2 semanas) */}
        {activeTab === 'guaranteed' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">Compromiso Solidario</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Deudas que Garantizo en Estado de Mora
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                En cumplimiento con el reglamento de EduCrédito UTB, cuando un estudiante al que respaldaste acumula dos semanas o más de impagos en sus lunes de cobro, el saldo impagado se notifica y refleja en esta sección de tu expediente.
              </p>
            </div>

            {guaranteedDebts.length === 0 ? (
              <div className="p-12 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-xs">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">Sin deudas en mora bajo tu garantía</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Todos los compañeros universitarios a quienes diste tu respaldo solidario como garante se encuentran al día en sus pagos de los lunes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guaranteedDebts.map((debt) => {
                  const saldoDeuda = debt.installments.reduce((acc, curr) => !curr.isPaid ? acc + curr.amount : acc, 0);
                  const cuotasAtresadas = debt.installments.filter(i => !i.isPaid).length;

                  return (
                    <div
                      key={debt.id}
                      className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border-2 border-red-500/80 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 uppercase">
                            Garante Solidario Activo
                          </span>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                            Estudiante: {debt.studentName}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {debt.faculty} • {debt.career} ({debt.semester}º Sem)
                          </p>
                        </div>
                        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <p className="font-semibold text-slate-500 uppercase text-[10px]">Saldo en mora:</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">${saldoDeuda.toFixed(2)} USD</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 uppercase text-[10px]">Cuotas atrasadas:</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{cuotasAtresadas} lunes sin pagar</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        <b>Acción requerida:</b> Te sugerimos contactar a <b>{debt.studentName}</b> (Cédula: {debt.studentCedula}) para que efectúe el pago correspondiente y normalice tu historial como garante universitario en la plataforma.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
