'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  subscribeToAllLoans,
  adminApproveLoan,
  adminRejectLoan,
} from '../../lib/firebase/loans';
import type { LoanApplication } from '../../types/credit';
import { ThemeToggleButton } from '../../components/theme/ThemeProvider';
import {
  ShieldCheck, Users, DollarSign, BarChart3, LogOut, Loader2,
  CheckCircle2, XCircle, AlertCircle, Clock, FileText, Filter, MessageSquare,
  CircleDot, CircleDashed, AlertTriangle, X,
} from 'lucide-react';
import { AnalyticsBI } from '../../components/admin/AnalyticsBI';

export default function AdminDashboardPage() {
  const { profile, authUser, loading, logout } = useAuth();
  const router = useRouter();

  const [allLoans, setAllLoans] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expedientes' | 'analytics'>('expedientes');

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">
            Abriendo consola directiva de secretaría UTB...
          </p>
        </div>
      </div>
    );
  }

  const filteredLoans = allLoans.filter((loan) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return loan.status === 'pending';
    if (filterStatus === 'active') return loan.status === 'active' || loan.status === 'approved' || loan.status === 'overdue';
    if (filterStatus === 'rejected') return loan.status === 'rejected';
    return true;
  });

  const pendingCount = allLoans.filter((l) => l.status === 'pending').length;
  const activeCount = allLoans.filter((l) => ['active', 'approved', 'overdue'].includes(l.status)).length;
  const rejectedCount = allLoans.filter((l) => l.status === 'rejected').length;
  const totalCapitalCometido = allLoans
    .filter((l) => ['active', 'approved', 'overdue', 'pending'].includes(l.status))
    .reduce((sum, item) => sum + item.requestedAmount, 0);

  const handleApprove = async (loan: LoanApplication) => {
    if (!loan.id) return;
    if (!confirm(`¿Estás seguro de APROBAR el crédito de $${loan.requestedAmount}.00 USD para el estudiante ${loan.studentName}?`)) return;

    setProcessingId(loan.id);
    const res = await adminApproveLoan(loan.id);
    setProcessingId(null);

    if (res.success) {
      alert(`Crédito de ${loan.studentName} aprobado exitosamente. Se ha habilitado su cronograma de cobros semanales.`);
    } else {
      alert(`Error al aprobar: ${res.error}`);
    }
  };

  const openRejectionModal = (loan: LoanApplication) => {
    setRejectionModalLoan(loan);
    setRejectionReasonInput('');
    setSelectedPreset('');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalLoan || !rejectionModalLoan.id) return;

    const finalMessage = selectedPreset && selectedPreset !== 'custom'
      ? `${selectedPreset}. ${rejectionReasonInput}`.trim()
      : rejectionReasonInput.trim();

    if (!finalMessage) {
      alert('Por favor ingresa el motivo oficial de rechazo para notificar con claridad al estudiante.');
      return;
    }

    setProcessingId(rejectionModalLoan.id);
    const res = await adminRejectLoan(rejectionModalLoan.id, finalMessage);
    setProcessingId(null);

    if (res.success) {
      alert(`Solicitud rechazada correctamente. Se notificó al estudiante con el motivo: "${finalMessage}".`);
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

  const kpis = [
    { label: 'En cola de revisión', value: pendingCount, icon: Clock, color: 'text-warning', note: 'Requieren dictamen oficial' },
    { label: 'Créditos en operación', value: activeCount, icon: DollarSign, color: 'text-success', note: 'Desembolsados y activos' },
    { label: 'Trámites devueltos', value: rejectedCount, icon: XCircle, color: 'text-danger', note: 'Con retroalimentación enviada' },
    { label: 'Capital rotativo activo', value: `$${totalCapitalCometido}`, icon: BarChart3, color: 'text-primary', note: 'Monto global comprometido' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">

      {/* CABECERA */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-foreground text-background">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Consola Directiva UTB
              </span>
              <h1 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                Secretaría y control del fondo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <button
              onClick={() => logout().then(() => router.push('/login'))}
              className="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-danger" />
              <span className="hidden sm:inline">Salir del portal admin</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">

        {/* BANNER DIRECTIVO */}
        <div className="p-6 sm:p-8 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estación de revisión y dictamen crediticio
            </p>
            <h2 className="font-serif text-2xl font-semibold text-card-foreground tracking-tight">
              Gestión de solicitudes y expedientes
            </h2>
            <p className="text-sm text-muted-foreground">
              Sesión activa: <b className="text-foreground">{authUser?.email || 'Administrador UTB'}</b> · Verifica notas semestrales y elegibilidad de garantes antes de emitir un dictamen.
            </p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-success-soft border border-success/20 text-success text-sm shrink-0 font-medium">
            <p className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Motor de scoring calibrado
            </p>
            <p className="mt-0.5 opacity-90">Rango permitido: $10 a $30 USD</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="p-5 rounded-xl bg-card border border-border shadow-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase">{kpi.label}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`font-serif text-3xl font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</span>
                  <Icon className={`w-6 h-6 opacity-50 ${kpi.color}`} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{kpi.note}</p>
              </div>
            );
          })}
        </div>

        {/* SELECTOR DE MÓDULOS */}
        <div className="flex flex-wrap p-1.5 rounded-2xl bg-muted border border-border w-fit gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('expedientes')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'expedientes'
                ? 'bg-card text-card-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'expedientes' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Mesa de evaluación</span>
            <span className={`px-2 py-0.5 text-[11px] rounded-full font-extrabold ${
              activeTab === 'expedientes' ? 'bg-primary/10 text-primary' : 'bg-border text-muted-foreground'
            }`}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2.5 ${
              activeTab === 'analytics'
                ? 'bg-card text-card-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>Analítica BI y reportes</span>
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <AnalyticsBI allLoans={allLoans} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-bold text-foreground">Mesa de evaluación de créditos</h3>
              </div>

              <div className="flex overflow-x-auto gap-1 text-xs font-medium">
                {[
                  { id: 'pending' as const, label: 'Pendientes', count: pendingCount, active: 'bg-warning-soft text-warning border border-warning/30' },
                  { id: 'active' as const, label: 'Activos / En curso', count: activeCount, active: 'bg-success-soft text-success border border-success/30' },
                  { id: 'rejected' as const, label: 'Rechazados', count: rejectedCount, active: 'bg-danger-soft text-danger border border-danger/30' },
                  { id: 'all' as const, label: 'Todas', count: allLoans.length, active: 'bg-foreground text-background' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`py-2 px-3.5 rounded-lg transition shrink-0 flex items-center gap-1.5 font-semibold ${
                      filterStatus === f.id ? f.active : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 tabular-nums">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {filteredLoans.length === 0 ? (
              <div className="p-16 rounded-xl bg-card border border-border text-center space-y-3 shadow-sm">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-base font-semibold text-card-foreground">No hay solicitudes para mostrar en esta vista</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No se encontraron trámites con el filtro seleccionado. Selecciona otra categoría en las pestañas superiores.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLoans.map((loan) => {
                  const isProcessing = processingId === loan.id;
                  const isNovato = loan.semester === 1;
                  const garanteValidoSemestres = !isNovato || (loan.guarantorSemester && loan.guarantorSemester >= 2);

                  const statusMeta = {
                    active: { cls: 'bg-success-soft text-success', icon: CircleDot, label: 'Desembolsado y en curso' },
                    pending: { cls: 'bg-warning-soft text-warning', icon: CircleDashed, label: 'Pendiente de verificación' },
                    rejected: { cls: 'bg-danger-soft text-danger', icon: XCircle, label: 'Devuelto / rechazado' },
                    overdue: { cls: 'bg-danger-soft text-danger', icon: AlertTriangle, label: 'En mora (Reportado)' },
                  }[loan.status] || { cls: 'bg-primary/10 text-primary', icon: CheckCircle2, label: 'Liquidado' };
                  const StatusIcon = statusMeta.icon;

                  return (
                    <div key={loan.id} className="p-6 rounded-xl bg-card border border-border shadow-sm transition hover:border-primary/30 space-y-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-mono font-bold text-muted-foreground">
                              REF: {loan.id?.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusMeta.cls}`}>
                              <StatusIcon className="w-3 h-3" /> {statusMeta.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Fecha: {new Date(loan.createdAt || Date.now()).toLocaleDateString('es-EC')}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-3 pt-1 flex-wrap">
                            <h4 className="text-xl font-bold text-card-foreground">{loan.studentName}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {loan.career} · {loan.semester || 1}º Semestre
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-1 flex-wrap">
                            <span>Cédula: <b className="text-foreground">{loan.studentCedula || 'No registrada'}</b></span>
                            <span>Promedio declarado: <b className="text-primary font-bold">{loan.previousSemesterGrade || 'N/D'} / 10.00</b></span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/60 border border-border text-right shrink-0 min-w-44">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Monto solicitado</span>
                          <span className="font-serif text-2xl font-semibold text-card-foreground tabular-nums">
                            ${loan.requestedAmount}.00 <span className="text-xs font-normal text-muted-foreground">USD</span>
                          </span>
                          <p className="text-xs font-medium text-primary mt-1">
                            Plazo: {loan.durationWeeks} semanas de repago
                          </p>
                        </div>
                      </div>

                      {/* GARANTÍA */}
                      <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-bold text-card-foreground">
                              Garante solidario propuesto: {loan.guarantorName || 'No identificado'}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            Identificador: <b className="text-foreground">{loan.guarantorCedula || 'N/A'}</b> · Cursa el <b className="text-foreground">{loan.guarantorSemester || 2}º Semestre</b>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {garanteValidoSemestres ? (
                            <span className="px-2.5 py-1 rounded-md bg-success-soft text-success border border-success/20 text-[11px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Garante verificado conforme al reglamento
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-danger-soft text-danger border border-danger/20 text-[11px] font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Alerta: novato con garante menor a 2º semestre
                            </span>
                          )}
                        </div>
                      </div>

                      {loan.status === 'rejected' && loan.rejectionReason && (
                        <div className="p-3.5 rounded-lg bg-danger-soft border border-danger/20 text-sm text-foreground flex items-start gap-2.5">
                          <MessageSquare className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-danger block">Dictamen de rechazo enviado al estudiante:</span>
                            <p className="mt-0.5 leading-relaxed text-muted-foreground">{loan.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {loan.status === 'pending' && (
                        <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-3">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => openRejectionModal(loan)}
                            className="h-10 px-5 rounded-lg bg-card hover:bg-danger-soft text-danger border border-danger/40 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rechazar y notificar motivo</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(loan)}
                            className="h-10 px-6 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Aprobar y desembolsar crédito</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE RECHAZO */}
      {rejectionModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-danger-soft text-danger">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">
                    Rechazar solicitud de {rejectionModalLoan.studentName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Monto: ${rejectionModalLoan.requestedAmount}.00 USD · REF: {rejectionModalLoan.id?.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalLoan(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-5">
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase text-foreground">
                  1. Elige una causa frecuente del reglamento (opcional):
                </span>
                <div className="space-y-2">
                  {presetReasons.map((preset, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/50 text-sm text-foreground cursor-pointer hover:border-primary/40 transition"
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
                        className="mt-0.5 accent-danger"
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/50 text-sm font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="preset-reason"
                      value="custom"
                      checked={selectedPreset === 'custom'}
                      onChange={() => {
                        setSelectedPreset('custom');
                        setRejectionReasonInput('');
                      }}
                      className="accent-danger"
                    />
                    <span>Redactar motivo personalizado o aclaraciones adicionales...</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="custom-reason" className="block text-xs font-bold uppercase text-foreground">
                  2. Mensaje oficial que recibirá el estudiante en su portal:
                </label>
                <textarea
                  id="custom-reason"
                  rows={3}
                  required
                  placeholder="Explica clara y respetuosamente por qué no fue aprobada la solicitud y cómo el estudiante puede solucionarlo..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-danger"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRejectionModalLoan(null)}
                  className="h-10 px-5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectionModalLoan.id || !rejectionReasonInput.trim()}
                  className="h-10 px-6 rounded-lg bg-danger hover:opacity-90 text-danger-foreground font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {processingId === rejectionModalLoan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirmar rechazo y enviar mensaje</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
