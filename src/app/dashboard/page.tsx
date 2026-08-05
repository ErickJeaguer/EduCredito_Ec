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
  type VerifiedGuarantor,
} from '../../lib/firebase/loans';
import type { LoanApplication, PaymentReceipt } from '../../types/credit';
import { ThemeToggleButton } from '../../components/theme/ThemeProvider';
import { ReceiptModal } from '../../components/payments/ReceiptModal';
import {
  GraduationCap, LogOut, AlertTriangle, ChevronRight, FileText, Loader2,
  DollarSign, Check, Play, UserCheck, AlertCircle, Receipt, CircleDot,
  CircleDashed, XCircle, CheckCircle2, CalendarClock, Wallet,
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
    role: 'student' as const,
  } : null);

  const [activeTab, setActiveTab] = useState<'summary' | 'simulator' | 'loans' | 'guaranteed'>('summary');
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [guaranteedDebts, setGuaranteedDebts] = useState<LoanApplication[]>([]);
  const [activeRestriction, setActiveRestriction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    if (!loading && !authUser && !profile) {
      router.replace('/login');
    }
  }, [authUser, profile, loading, router]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeLoans = subscribeToStudentLoans(user.uid, (loans) => {
      setMyLoans(loans);

      const pending = loans.find((l) => l.status === 'pending');
      const active = loans.find((l) => l.status === 'approved' || l.status === 'active' || l.status === 'overdue');

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">
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
    if (res.success && res.receipt) {
      setActiveReceipt(res.receipt);
    } else if (res.success) {
      alert('Abono de cuota semanal registrado exitosamente.');
    } else {
      alert('Error al simular pago: ' + res.error);
    }
  };

  const handleShowExistingReceipt = (loan: LoanApplication, inst: any) => {
    const receipt: PaymentReceipt = {
      referenceNumber: inst.receiptReference || `UTB-REC-${new Date().getFullYear()}-AUDITADO`,
      loanId: loan.id || 'N/A',
      studentName: loan.studentName,
      studentCedula: loan.studentCedula,
      weekNumber: inst.weekNumber,
      amount: inst.amount,
      principal: inst.principal,
      interest: inst.interest,
      paidAt: inst.paidAt || loan.updatedAt || new Date().toISOString(),
      remainingLoanBalance: inst.remainingBalance,
      status: 'CUOTA ABONADA CON ÉXITO',
    };
    setActiveReceipt(receipt);
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
  const creditoActivo = myLoans.find((l) => ['active', 'approved', 'overdue'].includes(l.status));
  const saldoPendiente = creditoActivo
    ? creditoActivo.installments.reduce((acc, curr) => (!curr.isPaid ? acc + curr.amount : acc), 0)
    : 0;

  const proximoVencimiento = creditoActivo?.installments.find((i) => !i.isPaid)?.dueDate || 'Sin cobros en cola';

  const tabs = [
    { id: 'summary' as const, label: 'Resumen general' },
    { id: 'simulator' as const, label: 'Simular y solicitar' },
    { id: 'loans' as const, label: `Mis préstamos (${totalCreditos})` },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* CABECERA */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block">EduCrédito UTB</span>
              <h1 className="text-sm sm:text-base font-bold text-foreground">{user.fullName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <button
              onClick={() => logout()}
              className="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition flex items-center gap-1.5"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4 text-danger" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">

        {/* ALERTA DE DEUDAS GARANTIZADAS EN MORA */}
        {guaranteedDebts.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl bg-warning-soft border-l-4 border-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-warning block">
                  Notificación de compromiso solidario
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  Tienes {guaranteedDebts.length} deuda(s) en mora como garante solidario
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  El estudiante <b className="text-foreground">{guaranteedDebts[0].studentName}</b> ha acumulado retrasos en sus cuotas semanales. Revisa tus responsabilidades para prevenir restricciones en el fondo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('guaranteed')}
              className="h-9 px-4 rounded-lg bg-warning hover:opacity-90 text-warning-foreground text-sm font-semibold shrink-0 transition"
            >
              Revisar garantías ({guaranteedDebts.length})
            </button>
          </div>
        )}

        {/* ALERTA DE SOLICITUD RECHAZADA */}
        {myLoans.filter((l) => l.status === 'rejected').map((rej) => (
          <div key={rej.id} className="p-4 sm:p-5 rounded-xl bg-danger-soft border-l-4 border-danger flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-danger block">
                  Dictamen de la secretaría administrativa de créditos
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  Tu solicitud de microcrédito por ${rej.requestedAmount}.00 USD no ha sido aprobada
                </p>
                <div className="mt-2 p-3 rounded-lg bg-card border border-border text-sm text-muted-foreground">
                  <span className="font-bold text-danger">Motivo oficial:</span>
                  <p className="mt-0.5 leading-relaxed font-medium">{rej.rejectionReason || 'La documentación o garante no cumple temporalmente con los requisitos institucionales del fondo.'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="h-9 px-4 rounded-lg bg-danger hover:opacity-90 text-danger-foreground text-sm font-semibold shrink-0 transition"
            >
              Corregir y postular
            </button>
          </div>
        ))}

        {/* FICHA ACADÉMICA */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expediente de matrícula · {user.faculty}</p>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-card-foreground mt-1">{user.career}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm font-medium text-muted-foreground">
              <span>Nivel: <b className="text-foreground">{user.semester ? `${user.semester}º Semestre` : '1er Semestre'}</b></span>
              {user.cedula && <span>Cédula: <b className="text-foreground">{user.cedula}</b></span>}
            </div>
          </div>

          <div className="px-4 py-3 rounded-lg bg-success-soft border border-success/20 text-left sm:text-right shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground block">Elegibilidad en fondo</span>
            <span className="text-sm font-bold text-success flex items-center gap-1 mt-0.5">
              <UserCheck className="w-4 h-4" /> Apto para solicitar
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex overflow-x-auto gap-1 border-b border-border pb-1 text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 rounded-lg transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-muted text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {guaranteedDebts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('guaranteed')}
              className={`py-2.5 px-4 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'guaranteed'
                  ? 'bg-danger-soft text-danger font-semibold border border-danger/30'
                  : 'text-danger hover:opacity-80'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Deudas que garantizo ({guaranteedDebts.length})
            </button>
          )}
        </div>

        {/* TAB 1: RESUMEN */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <p className="text-xs font-semibold uppercase">Cupo máximo habilitado</p>
                  </div>
                  <p className="font-serif text-3xl font-semibold text-card-foreground mt-2 tabular-nums">
                    {activeRestriction ? '$0.00' : '$30.00'} <span className="text-xs font-semibold text-muted-foreground">USD</span>
                  </p>
                </div>
                <p className="text-sm text-primary font-medium mt-4">
                  {activeRestriction ? 'Crédito en curso actualmente' : 'Rango disponible: $10.00 a $30.00 USD'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <p className="text-xs font-semibold uppercase">Deuda propia activa</p>
                  </div>
                  <p className="font-serif text-3xl font-semibold text-card-foreground mt-2 tabular-nums">
                    ${saldoPendiente.toFixed(2)} <span className="text-xs font-semibold text-muted-foreground">USD</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground font-medium mt-4">
                  {creditoActivo ? `Crédito en curso a ${creditoActivo.durationWeeks} semanas` : 'Sin saldos pendientes'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="w-4 h-4" />
                    <p className="text-xs font-semibold uppercase">Próxima fecha de repago</p>
                  </div>
                  <p className="font-serif text-lg font-semibold text-card-foreground mt-3 truncate">{proximoVencimiento}</p>
                </div>
                <p className="text-sm text-accent font-medium mt-4">
                  {creditoActivo ? 'Recuerda tener tu cuota en secretaría' : 'Expediente al día'}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-primary text-primary-foreground shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  Simulador cooperativo en tiempo real
                </span>
                <h3 className="font-serif text-xl font-semibold">¿Necesitas materiales, software o viáticos académicos?</h3>
                <p className="text-sm leading-relaxed opacity-80">
                  Configura tu cuota semanal fija con la tasa solidaria del 8.5% anual y semana de gracia inicial.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('simulator')}
                className="h-11 px-5 rounded-lg bg-accent hover:opacity-90 text-accent-foreground font-semibold text-sm transition shrink-0 flex items-center gap-1.5 shadow-sm"
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

        {/* TAB 3: MIS PRÉSTAMOS */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-semibold text-foreground">Historial de préstamos y cuotas semanales</h3>

            {myLoans.length === 0 ? (
              <div className="p-12 rounded-xl bg-card border border-border text-center space-y-3 shadow-sm">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-base font-semibold text-card-foreground">Aún no tienes créditos en tu expediente</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Si requieres apoyo para libros o viáticos, puedes configurar tu primera solicitud en el simulador solidario.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="h-9 px-4 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition"
                >
                  Ir al simulador de crédito
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myLoans.map((loan) => {
                  const pagadas = loan.installments.filter((i) => i.isPaid).length;
                  const totalCuotas = loan.installments.length;
                  const porcentaje = totalCuotas > 0 ? Math.round((pagadas / totalCuotas) * 100) : 0;
                  const isSelected = selectedLoanForDetails === loan.id;

                  const statusMeta = {
                    active: { cls: 'bg-success-soft text-success', icon: CircleDot, label: 'Préstamo en curso (Activo)' },
                    pending: { cls: 'bg-warning-soft text-warning', icon: CircleDashed, label: 'En revisión administrativa' },
                    rejected: { cls: 'bg-danger-soft text-danger', icon: XCircle, label: 'Solicitud devuelta / rechazada' },
                    overdue: { cls: 'bg-danger-soft text-danger', icon: AlertTriangle, label: 'En mora (Reportado a garante)' },
                    default: { cls: 'bg-primary/10 text-primary', icon: CheckCircle2, label: 'Liquidado / Pagado' },
                  }[loan.status] || { cls: 'bg-primary/10 text-primary', icon: CheckCircle2, label: 'Liquidado / Pagado' };
                  const StatusIcon = statusMeta.icon;

                  return (
                    <div key={loan.id} className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">REF: {loan.id?.slice(0, 8)}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusMeta.cls}`}>
                              <StatusIcon className="w-3 h-3" /> {statusMeta.label}
                            </span>
                          </div>
                          <h4 className="font-serif text-xl font-semibold text-card-foreground mt-1 tabular-nums">
                            ${loan.requestedAmount}.00 <span className="text-xs font-normal text-muted-foreground">en {loan.durationWeeks} cuotas semanales</span>
                          </h4>
                        </div>

                        <div className="bg-muted/60 p-3.5 rounded-lg border border-border text-sm text-left sm:text-right">
                          <p className="text-muted-foreground uppercase font-semibold text-[10px]">Garante solidario</p>
                          <p className="font-bold text-card-foreground mt-0.5">{loan.guarantorName || 'No especificado'}</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">Promedio reportado: <b className="text-foreground">{loan.previousSemesterGrade || '---'}</b></p>
                        </div>
                      </div>

                      {loan.status === 'rejected' && loan.rejectionReason && (
                        <div className="p-3.5 rounded-lg bg-danger-soft border border-danger/20 text-sm text-foreground flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-danger block">Observación oficial de secretaría:</span>
                            <p className="mt-0.5 leading-relaxed font-medium text-muted-foreground">{loan.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Progreso */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                          <span>Progreso: {pagadas} de {totalCuotas} cuotas abonadas</span>
                          <span className="font-semibold text-primary">{porcentaje}% liquidado</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                        </div>
                      </div>

                      {/* Panel demo */}
                      <div className="p-3.5 rounded-lg bg-muted/60 border border-border flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-muted-foreground">Panel de simulación y pruebas en vivo:</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {loan.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleDemoApprove(loan.id!)}
                              className="h-8 px-3 rounded-md bg-accent hover:opacity-90 text-accent-foreground font-semibold text-xs transition flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Aprobar crédito
                            </button>
                          )}
                          {loan.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleDemoOverdue(loan.id!)}
                              className="h-8 px-3 rounded-md bg-danger hover:opacity-90 text-danger-foreground font-semibold text-xs transition flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Simular mora
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLoanForDetails(isSelected ? null : loan.id!)}
                            className="h-8 px-3.5 rounded-md bg-foreground hover:opacity-90 text-background font-semibold text-xs transition"
                          >
                            {isSelected ? 'Ocultar cronograma' : 'Ver cuotas semanales'}
                          </button>
                        </div>
                      </div>

                      {/* Tabla de cuotas */}
                      {isSelected && (
                        <div className="pt-2 overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-muted-foreground border-b border-border font-semibold">
                              <tr>
                                <th className="py-2.5 px-3">Cuota #</th>
                                <th className="py-2.5 px-3">Vencimiento</th>
                                <th className="py-2.5 px-3">Monto semanal</th>
                                <th className="py-2.5 px-3">Estado</th>
                                <th className="py-2.5 px-3 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                              {loan.installments.map((inst, idx) => (
                                <tr key={inst.weekNumber} className={`hover:bg-muted/50 transition ${inst.isPaid ? 'bg-success-soft/40' : ''}`}>
                                  <td className="py-2.5 px-3 font-semibold">Semana {inst.weekNumber}</td>
                                  <td className="py-2.5 px-3 font-medium text-muted-foreground">{inst.dueDate}</td>
                                  <td className="py-2.5 px-3 font-bold text-card-foreground tabular-nums">${inst.amount.toFixed(2)}</td>
                                  <td className="py-2.5 px-3">
                                    {inst.isPaid ? (
                                      <span className="inline-flex items-center gap-1 text-success font-semibold px-2 py-0.5 rounded-full bg-success-soft text-[11px]">
                                        <Check className="w-3 h-3" /> Liquidada
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-warning font-medium px-2 py-0.5 rounded-full bg-warning-soft text-[11px]">
                                        Pendiente
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {!inst.isPaid ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSimulatePayment(loan.id!, idx)}
                                        className="h-7 px-3 rounded-md bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs shadow-sm transition transform active:scale-95 flex items-center gap-1 ml-auto"
                                      >
                                        <DollarSign className="w-3.5 h-3.5" /> Pagar cuota
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleShowExistingReceipt(loan, inst)}
                                        className="h-7 px-2.5 rounded-md border border-primary/40 hover:bg-primary/10 text-primary font-medium text-[11px] transition inline-flex items-center gap-1"
                                      >
                                        <Receipt className="w-3 h-3" /> Ver recibo
                                      </button>
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

        {/* TAB 4: DEUDAS QUE GARANTIZO */}
        {activeTab === 'guaranteed' && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <span className="text-xs font-bold text-danger uppercase tracking-wider block">Compromiso solidario</span>
              <h3 className="font-serif text-xl font-semibold text-foreground mt-1">Deudas que garantizo en estado de mora</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                En cumplimiento con el reglamento de EduCrédito UTB, cuando un estudiante al que respaldaste acumula dos semanas o más de impagos en sus cuotas, el saldo impagado se notifica y refleja en esta sección de tu expediente.
              </p>
            </div>

            {guaranteedDebts.length === 0 ? (
              <div className="p-12 rounded-xl bg-card border border-border text-center space-y-2 shadow-sm">
                <Check className="w-8 h-8 text-success mx-auto" />
                <h4 className="text-base font-semibold text-card-foreground">Sin deudas en mora bajo tu garantía</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Todos los compañeros a quienes diste tu respaldo solidario como garante se encuentran al día en sus obligaciones financieras.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guaranteedDebts.map((debt) => {
                  const saldoDeuda = debt.installments.reduce((acc, curr) => (!curr.isPaid ? acc + curr.amount : acc), 0);
                  const cuotasAtresadas = debt.installments.filter((i) => !i.isPaid).length;

                  return (
                    <div key={debt.id} className="p-6 rounded-xl bg-card border-2 border-danger/60 shadow-sm space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-soft text-danger uppercase">
                            Garante solidario activo
                          </span>
                          <h4 className="text-lg font-bold text-card-foreground mt-1">Estudiante: {debt.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{debt.faculty} · {debt.career} ({debt.semester}º Sem)</p>
                        </div>
                        <AlertCircle className="w-6 h-6 text-danger shrink-0" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-muted/60 p-3.5 rounded-lg border border-border text-sm">
                        <div>
                          <p className="font-semibold text-muted-foreground uppercase text-[10px]">Saldo en mora</p>
                          <p className="font-serif text-xl font-semibold text-danger mt-0.5 tabular-nums">${saldoDeuda.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground uppercase text-[10px]">Cuotas atrasadas</p>
                          <p className="text-sm font-bold text-card-foreground mt-1">{cuotasAtresadas} sin pagar</p>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground leading-relaxed pt-1">
                        <b className="text-foreground">Acción requerida:</b> contacta a <b className="text-foreground">{debt.studentName}</b> (Cédula: {debt.studentCedula}) para que efectúe el pago correspondiente y normalice tu historial como garante.
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
}
