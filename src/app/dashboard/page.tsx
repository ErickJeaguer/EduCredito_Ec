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
import { CreditWalletHero } from '../../components/dashboard/CreditWalletHero';
import {
  GraduationCap, LogOut, AlertTriangle, FileText, Loader2,
  DollarSign, Check, Play, UserCheck, AlertCircle, Receipt,
  ChevronRight, Shield, TrendingUp, Calendar, ArrowRight, Star,
  CheckCircle2, Sparkles, ShieldCheck
} from 'lucide-react';

type TabId = 'summary' | 'simulator' | 'loans' | 'guaranteed';

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  active:   { label: 'En curso',   badgeClass: 'badge badge-success' },
  pending:  { label: 'En revisión', badgeClass: 'badge badge-warning' },
  rejected: { label: 'Devuelto',   badgeClass: 'badge badge-danger'  },
  overdue:  { label: 'En mora',    badgeClass: 'badge badge-danger'  },
  paid:     { label: 'Liquidado',  badgeClass: 'badge badge-info'    },
};

export default function StudentDashboardPage() {
  const { profile, authUser, loading, logout } = useAuth();
  const router = useRouter();

  const user = profile || (authUser
    ? {
        uid: authUser.uid,
        fullName: authUser.displayName || authUser.email?.split('@')[0] || 'Estudiante UTB',
        email: authUser.email || '',
        cedula: '',
        faculty: 'Universidad Técnica de Babahoyo',
        career: 'Especialidad Universitaria',
        semester: 1,
        phone: '',
        role: 'student' as const,
      }
    : null);

  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [guaranteedDebts, setGuaranteedDebts] = useState<LoanApplication[]>([]);
  const [activeRestriction, setActiveRestriction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    amount: number;
    weeks: number;
    guarantorName: string;
    certificateFileName?: string;
  } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!authUser) {
      router.replace('/login');
      return;
    }
    // Si el perfil ya está resuelto y es admin, redirigir a la consola correcta
    if (profile && profile.role === 'admin') {
      router.replace('/admin');
    }
  }, [authUser, profile, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsubLoans = subscribeToStudentLoans(user.uid, (loans) => {
      setMyLoans(loans);
      const pending = loans.find((l) => l.status === 'pending');
      const active = loans.find((l) => ['approved', 'active', 'overdue'].includes(l.status));
      if (pending) setActiveRestriction('Tienes una solicitud en revisión por secretaría.');
      else if (active) setActiveRestriction('Tienes un microcrédito activo. Liquida tus cuotas antes de solicitar otro.');
      else setActiveRestriction(null);
    });
    const unsubGuarantee = subscribeToGuaranteedDebts(user.uid, setGuaranteedDebts);
    return () => { unsubLoans(); unsubGuarantee(); };
  }, [user?.uid]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-page)' }}>
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--brand)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--ink-3)' }}>Cargando tu expediente...</p>
        </div>
      </div>
    );
  }

  /* ── Handlers ─────────────────────────────────── */
  const handleApplyLoan = async (
    amount: number, 
    weeks: number, 
    grade: number, 
    guarantor: VerifiedGuarantor,
    certificateUrl?: string,
    certificateFileName?: string
  ) => {
    if (!user) return;
    setIsSubmitting(true);
    const result = await createLoanRequest(user, amount, weeks, grade, guarantor, certificateUrl, certificateFileName);
    setIsSubmitting(false);
    if (result.success) {
      setSuccessModalData({
        amount,
        weeks,
        guarantorName: guarantor.fullName,
        certificateFileName,
      });
    } else {
      alert(`No se pudo procesar tu trámite: ${result.error}`);
    }
  };

  const handleSimulatePayment = async (loanId: string, index: number) => {
    const res = await simulateInstallmentPayment(loanId, index);
    if (res.success && res.receipt) setActiveReceipt(res.receipt);
    else if (res.success) alert('Cuota registrada exitosamente.');
    else alert('Error: ' + res.error);
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
    alert('Demo: Préstamo aprobado.');
  };

  const handleDemoOverdue = async (loanId: string) => {
    await demoSimulateOverdue(loanId);
    alert('Demo: Préstamo en MORA.');
  };

  /* ── Datos derivados ──────────────────────────── */
  const creditoActivo = myLoans.find((l) => ['active', 'approved', 'overdue'].includes(l.status));
  const saldoPendiente = creditoActivo
    ? creditoActivo.installments.reduce((acc, cur) => (!cur.isPaid ? acc + cur.amount : acc), 0)
    : 0;
  const montoPagado = creditoActivo
    ? creditoActivo.installments.reduce((acc, cur) => (cur.isPaid ? acc + cur.amount : acc), 0)
    : 0;
  const cuotasPagadas = creditoActivo ? creditoActivo.installments.filter((i) => i.isPaid).length : 0;
  const proximaInst = creditoActivo?.installments.find((i) => !i.isPaid);
  const proximoVencimiento = proximaInst?.dueDate || '—';
  const proximaCuotaMonto = proximaInst?.amount || 0;

  const TABS: Array<{ id: TabId; label: string; count?: number; danger?: boolean }> = [
    { id: 'summary',   label: 'Resumen' },
    { id: 'simulator', label: 'Nuevo crédito' },
    { id: 'loans',     label: 'Mis créditos', count: myLoans.length },
    ...(guaranteedDebts.length > 0
      ? [{ id: 'guaranteed' as const, label: 'Garantías', count: guaranteedDebts.length, danger: true }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)' }}>

      {/* ── HEADER ────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 transition-all"
        style={{
          background: 'color-mix(in srgb, var(--surface-0) 90%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold leading-none block" style={{ color: 'var(--ink-1)' }}>
                EduCrédito <span style={{ color: 'var(--brand)' }}>UTB</span>
              </span>
              <span className="text-[10px] leading-none mt-0.5 block" style={{ color: 'var(--ink-3)' }}>
                {user.fullName}
              </span>
            </div>
          </div>

          {/* Badge de seguridad — sólo desktop */}
          <div className="hidden lg:flex">
            <div className="trust-badge">
              <Shield className="w-3.5 h-3.5" />
              Conexión segura 256-bit
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <button
              onClick={() => logout()}
              className="btn-ghost"
              style={{ height: '34px', padding: '0 12px', fontSize: '13px' }}
            >
              <LogOut className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Alerta garantías en mora */}
        {guaranteedDebts.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border-l-4 animate-fadein"
            style={{ background: 'var(--warning-bg)', borderLeftColor: 'var(--warning)' }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>
                  {guaranteedDebts.length} deuda(s) en mora bajo tu garantía
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-2)' }}>
                  <strong>{guaranteedDebts[0].studentName}</strong> tiene cuotas atrasadas.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('guaranteed')}
              className="btn-primary shrink-0"
              style={{ height: '36px', padding: '0 16px', fontSize: '13px', background: 'var(--warning)' }}
            >
              Ver garantías <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Alertas de rechazo */}
        {myLoans.filter((l) => l.status === 'rejected').map((rej) => (
          <div
            key={rej.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border-l-4 animate-fadein"
            style={{ background: 'var(--danger-bg)', borderLeftColor: 'var(--danger)' }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>
                  Solicitud por ${rej.requestedAmount}.00 USD no aprobada
                </p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--ink-2)' }}>
                  {rej.rejectionReason || 'La documentación o garante no cumple los requisitos.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="btn-primary shrink-0"
              style={{ height: '36px', padding: '0 16px', fontSize: '13px', background: 'var(--danger)' }}
            >
              Volver a solicitar
            </button>
          </div>
        ))}

        {/* ── TABS ────────────────────────────────────── */}
        <div
          className="flex overflow-x-auto gap-0.5 border-b -mb-px pb-px"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-t-xl shrink-0 transition-all duration-150 border-b-2 -mb-px"
                style={{
                  borderBottomColor: isActive ? 'var(--brand)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--ink-3)',
                  background: isActive ? 'var(--brand-muted)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: tab.danger ? 'var(--danger-bg)' : 'var(--surface-2)',
                      color: tab.danger ? 'var(--danger)' : 'var(--ink-2)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB: RESUMEN ────────────────────────────── */}
        {activeTab === 'summary' && (
          <div className="space-y-5 animate-fadein">

            {/* Ficha académica breve */}
            <div
              className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl"
              style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>{user.faculty}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink-1)' }}>
                  {user.career} · {user.semester}º Semestre
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Apto para solicitar
              </div>
            </div>

            {/* Credit Wallet Hero */}
            <CreditWalletHero
              studentName={user.fullName}
              totalDebt={creditoActivo?.requestedAmount || 0}
              paidAmount={montoPagado}
              remainingBalance={saldoPendiente}
              nextDueDate={proximoVencimiento}
              nextInstallmentAmount={proximaCuotaMonto}
              durationWeeks={creditoActivo?.durationWeeks || 0}
              paidInstallments={cuotasPagadas}
              hasActiveCredit={!!creditoActivo}
              onPayClick={() => setActiveTab('loans')}
              onSimulateClick={() => setActiveTab('simulator')}
            />

            {/* Feed de actividad reciente */}
            <div className="card">
              <div
                className="px-5 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>
                  Actividad reciente
                </h3>
                {myLoans.length > 0 && (
                  <button
                    onClick={() => setActiveTab('loans')}
                    className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand)' }}
                  >
                    Ver todo <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {myLoans.length === 0 ? (
                <div className="px-5 py-10 text-center space-y-2">
                  <FileText className="w-8 h-8 mx-auto" style={{ color: 'var(--ink-3)', opacity: 0.4 }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                    Aún no tienes movimientos registrados
                  </p>
                  <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
                    Solicita tu primer crédito para comenzar
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {myLoans.slice(0, 4).map((loan) => {
                    const lastPaid = [...loan.installments].reverse().find((i) => i.isPaid);
                    const st = STATUS_MAP[loan.status] || { label: loan.status, badgeClass: 'badge badge-neutral' };
                    return (
                      <div
                        key={loan.id}
                        className="px-5 py-3.5 flex items-center justify-between gap-4 transition-colors"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveTab('loans')}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-1)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <div className="flex items-center gap-3">
                          {/* Ícono circular por tipo */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: loan.status === 'active' ? 'var(--success-bg)'
                                : loan.status === 'pending' ? 'var(--warning-bg)'
                                : loan.status === 'paid' ? 'var(--info-bg)'
                                : 'var(--danger-bg)',
                            }}
                          >
                            {loan.status === 'active' ? (
                              <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
                            ) : loan.status === 'pending' ? (
                              <Calendar className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                            ) : loan.status === 'paid' ? (
                              <Check className="w-4 h-4" style={{ color: 'var(--info)' }} />
                            ) : (
                              <AlertCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--ink-1)' }}>
                              Microcrédito #{loan.id?.slice(0, 6)}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>
                              {lastPaid ? `Última cuota: ${lastPaid.dueDate}` : 'Sin abonos aún'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className="text-sm font-bold tabular-nums"
                            style={{
                              color: 'var(--ink-1)',
                              fontFamily: 'var(--font-family-mono, monospace)',
                            }}
                          >
                            ${loan.requestedAmount}.00
                          </p>
                          <span className={st.badgeClass}>{st.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA si no tiene crédito activo */}
            {!creditoActivo && (
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                style={{ background: '#090E17', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--brand)' }}>
                      Fondo Cooperativo UTB
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    ¿Necesitas materiales, software o viáticos académicos?
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Tasa solidaria 8.5% anual · Cuota fija semanal · Aprobación en 24h
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="shrink-0 flex items-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.98]"
                  style={{
                    height: '44px',
                    padding: '0 20px',
                    background: '#00C48C',
                    color: '#0D1421',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Abrir simulador
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SIMULADOR ─────────────────────────── */}
        {activeTab === 'simulator' && (
          <div className="animate-fadein">
            <CreditSimulator
              onApply={handleApplyLoan}
              isSubmitting={isSubmitting}
              activeRestriction={activeRestriction}
              applicantUid={user.uid}
              applicantSemester={user.semester || 1}
              userFaculty={user.faculty || 'Universidad Técnica de Babahoyo'}
              userCareer={user.career || 'Especialidad Universitaria'}
            />
          </div>
        )}

        {/* ── TAB: MIS CRÉDITOS ──────────────────────── */}
        {activeTab === 'loans' && (
          <div className="space-y-4 animate-fadein">
            <h3 className="text-base font-bold" style={{ color: 'var(--ink-1)' }}>
              Historial de créditos
            </h3>

            {myLoans.length === 0 ? (
              <div className="card p-12 text-center space-y-3">
                <FileText className="w-8 h-8 mx-auto" style={{ color: 'var(--ink-3)', opacity: 0.4 }} />
                <h4 className="text-base font-semibold" style={{ color: 'var(--ink-1)' }}>
                  Aún no tienes créditos
                </h4>
                <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--ink-2)' }}>
                  Solicita tu primer microcrédito en el simulador.
                </p>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="btn-primary mx-auto"
                  style={{ height: '38px', padding: '0 20px', fontSize: '13px' }}
                >
                  Ir al simulador
                </button>
              </div>
            ) : (
              myLoans.map((loan) => {
                const pagadas = loan.installments.filter((i) => i.isPaid).length;
                const totalCuotas = loan.installments.length;
                const porcentaje = Math.round((pagadas / totalCuotas) * 100);
                const isSelected = selectedLoanForDetails === loan.id;
                const st = STATUS_MAP[loan.status] || { label: loan.status, badgeClass: 'badge badge-neutral' };

                return (
                  <div key={loan.id} className="card overflow-hidden">
                    {/* Cabecera */}
                    <div
                      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono" style={{ color: 'var(--ink-3)' }}>
                            #{loan.id?.slice(0, 8)}
                          </span>
                          <span className={st.badgeClass}>{st.label}</span>
                        </div>
                        <p
                          className="text-xl font-extrabold tabular-nums"
                          style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-family-mono, monospace)' }}
                        >
                          ${loan.requestedAmount}.00
                          <span className="text-sm font-normal ml-1.5" style={{ color: 'var(--ink-3)' }}>
                            en {loan.durationWeeks} cuotas
                          </span>
                        </p>
                      </div>
                      <div
                        className="text-xs text-right p-3 rounded-xl"
                        style={{ background: 'var(--surface-1)' }}
                      >
                        <p className="font-medium" style={{ color: 'var(--ink-3)' }}>Garante solidario</p>
                        <p className="font-semibold mt-0.5" style={{ color: 'var(--ink-1)' }}>
                          {loan.guarantorName || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="px-5 py-4 space-y-4">
                      {/* Rechazo */}
                      {loan.status === 'rejected' && loan.rejectionReason && (
                        <div
                          className="flex items-start gap-3 p-3.5 rounded-xl text-sm border"
                          style={{
                            background: 'var(--danger-bg)',
                            borderColor: 'color-mix(in srgb, var(--danger) 20%, transparent)',
                          }}
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                          <div>
                            <span className="font-semibold block" style={{ color: 'var(--danger)' }}>
                              Observación de secretaría:
                            </span>
                            <p className="mt-0.5 leading-relaxed text-xs" style={{ color: 'var(--ink-2)' }}>
                              {loan.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Progreso */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--ink-2)' }}>
                          <span>{pagadas} de {totalCuotas} cuotas</span>
                          <span style={{ color: 'var(--brand)' }}>{porcentaje}% liquidado</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
                        </div>
                      </div>

                      {/* Acciones demo */}
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
                        style={{ background: 'var(--surface-1)', border: `1px solid var(--border-subtle)` }}
                      >
                        <span style={{ color: 'var(--ink-3)' }}>Panel de simulación:</span>
                        <div className="flex flex-wrap gap-2">
                          {loan.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleDemoApprove(loan.id!)}
                              className="h-7 px-3 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5"
                              style={{ background: 'var(--warning)' }}
                            >
                              <Play className="w-3 h-3" /> Aprobar
                            </button>
                          )}
                          {loan.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleDemoOverdue(loan.id!)}
                              className="h-7 px-3 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5"
                              style={{ background: 'var(--danger)' }}
                            >
                              <AlertTriangle className="w-3 h-3" /> Simular mora
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLoanForDetails(isSelected ? null : loan.id!)}
                            className="h-7 px-3 rounded-lg text-xs font-semibold transition"
                            style={{
                              background: 'var(--surface-0)',
                              color: 'var(--ink-1)',
                              border: `1px solid var(--border-strong)`,
                            }}
                          >
                            {isSelected ? 'Ocultar cuotas' : 'Ver cuotas'}
                          </button>
                        </div>
                      </div>

                      {/* Tabla de cuotas */}
                      {isSelected && (
                        <div className="overflow-x-auto animate-fadein rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ background: 'var(--surface-1)', color: 'var(--ink-2)' }}>
                                <th className="py-2.5 px-3 text-left font-semibold">#</th>
                                <th className="py-2.5 px-3 text-left font-semibold">Vencimiento</th>
                                <th className="py-2.5 px-3 text-left font-semibold">Monto</th>
                                <th className="py-2.5 px-3 text-left font-semibold">Estado</th>
                                <th className="py-2.5 px-3 text-right font-semibold">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loan.installments.map((inst, idx) => (
                                <tr
                                  key={inst.weekNumber}
                                  className="border-t"
                                  style={{
                                    borderColor: 'var(--border-subtle)',
                                    background: inst.isPaid
                                      ? 'color-mix(in srgb, var(--success) 4%, transparent)'
                                      : 'transparent',
                                  }}
                                >
                                  <td className="py-2.5 px-3 font-medium" style={{ color: 'var(--ink-2)' }}>
                                    {inst.weekNumber}
                                  </td>
                                  <td className="py-2.5 px-3" style={{ color: 'var(--ink-2)' }}>
                                    {inst.dueDate}
                                  </td>
                                  <td
                                    className="py-2.5 px-3 font-bold tabular-nums"
                                    style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-family-mono, monospace)' }}
                                  >
                                    ${inst.amount.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {inst.isPaid ? (
                                      <span className="badge badge-success">✓ Pagada</span>
                                    ) : (
                                      <span className="badge badge-warning">Pendiente</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {!inst.isPaid ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSimulatePayment(loan.id!, idx)}
                                        className="h-6 px-2.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1"
                                        style={{ background: 'var(--brand)' }}
                                      >
                                        <DollarSign className="w-3 h-3" /> Pagar
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleShowExistingReceipt(loan, inst)}
                                        className="h-6 px-2.5 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                                        style={{
                                          border: `1px solid color-mix(in srgb, var(--brand) 40%, transparent)`,
                                          color: 'var(--brand)',
                                        }}
                                      >
                                        <Receipt className="w-3 h-3" /> Recibo
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
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: GARANTÍAS ─────────────────────────── */}
        {activeTab === 'guaranteed' && (
          <div className="space-y-5 animate-fadein">
            <div className="border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--danger)' }}>
                Compromiso solidario
              </span>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--ink-1)' }}>
                Deudas que garantizo en mora
              </h3>
            </div>

            {guaranteedDebts.length === 0 ? (
              <div className="card p-12 text-center space-y-2">
                <Check className="w-8 h-8 mx-auto" style={{ color: 'var(--brand)' }} />
                <h4 className="text-base font-semibold" style={{ color: 'var(--ink-1)' }}>
                  Sin deudas en mora bajo tu garantía
                </h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guaranteedDebts.map((debt) => {
                  const saldoDeuda = debt.installments.reduce((acc, cur) => (!cur.isPaid ? acc + cur.amount : acc), 0);
                  const cuotasAtrasadas = debt.installments.filter((i) => !i.isPaid).length;
                  return (
                    <div
                      key={debt.id}
                      className="card p-5 space-y-4"
                      style={{ borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)', borderWidth: '1.5px' }}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div>
                          <span className="badge badge-danger mb-1">Garante activo</span>
                          <h4 className="text-base font-bold mt-1" style={{ color: 'var(--ink-1)' }}>
                            {debt.studentName}
                          </h4>
                          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
                            {debt.faculty} · {debt.semester}º Sem
                          </p>
                        </div>
                        <AlertCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--danger)' }} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--danger-bg)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>Saldo en mora</p>
                          <p
                            className="text-xl font-extrabold mt-0.5 tabular-nums"
                            style={{ color: 'var(--danger)', fontFamily: 'var(--font-family-mono, monospace)' }}
                          >
                            ${saldoDeuda.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-1)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>Cuotas atrasadas</p>
                          <p className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--ink-1)' }}>
                            {cuotasAtrasadas}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                        Contacta a <strong>{debt.studentName}</strong> (Cédula: {debt.studentCedula}) para coordinar el pago.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />

      {/* Ventanita Modal Animada con Visto de Solicitud Exitosa */}
      {successModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadein font-sans">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D1627] border-2 border-emerald-500/40 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 transform scale-100 transition-all">
            
            {/* Brillo decorativo de fondo */}
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

            {/* Icono animado de Visto (Check) */}
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-emerald-300/30 animate-bounce">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-white stroke-[2.5]" />
            </div>

            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Transmisión Exitosa
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ¡Solicitud Registrada!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tu expediente fue ingresado correctamente y ya está disponible para revisión del Administrador del Fondo UTB.
              </p>
            </div>

            {/* Resumen de los datos enviados */}
            <div className="relative z-10 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs sm:text-sm shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Monto / Plazo:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold font-mono text-sm">
                  ${successModalData.amount}.00 USD ({successModalData.weeks} sem.)
                </strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Garante validado:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[180px]">
                  {successModalData.guarantorName}
                </strong>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Promoción de notas:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[180px] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {successModalData.certificateFileName || 'Archivo_notas.pdf'}
                </strong>
              </div>
            </div>

            <p className="relative z-10 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Tiempo de respuesta de secretaría: <b>&lt; 24 horas</b>
            </p>

            <button
              type="button"
              onClick={() => {
                setSuccessModalData(null);
                setActiveTab('loans');
              }}
              className="relative z-10 w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Entendido, ver mi expediente</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
