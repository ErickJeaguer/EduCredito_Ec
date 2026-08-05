'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  subscribeToAllLoans, 
  adminApproveLoan, 
  adminRejectLoan,
  deleteLoanApplication,
  adminPurgeAllLoans,
  fetchLoanDocument
} from '../../lib/firebase/loans';
import type { LoanApplication } from '../../types/credit';
import { ThemeToggleButton } from '../../components/theme/ThemeProvider';
import { 
  ShieldCheck, Users, DollarSign, BarChart3, LogOut, Loader2, 
  CheckCircle2, XCircle, AlertCircle, Clock, FileText, Filter, MessageSquare, Trash2
} from 'lucide-react';
import { AnalyticsBI } from '../../components/admin/AnalyticsBI';
import { UserListTab } from '../../components/admin/UserListTab';

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  pending:  { label: 'En revisión',  badgeClass: 'badge badge-warning' },
  active:   { label: 'Activo',       badgeClass: 'badge badge-success' },
  approved: { label: 'Aprobado',     badgeClass: 'badge badge-success' },
  rejected: { label: 'Devuelto',     badgeClass: 'badge badge-danger'  },
  overdue:  { label: 'En mora',      badgeClass: 'badge badge-danger'  },
  paid:     { label: 'Liquidado',    badgeClass: 'badge badge-info'    },
};

export default function AdminDashboardPage() {
  const { authUser, profile, loading, logout } = useAuth();
  const router = useRouter();

  const [allLoans, setAllLoans] = useState<LoanApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expedientes' | 'analytics' | 'usuarios'>('expedientes');
  const [rejectionModalLoan, setRejectionModalLoan] = useState<LoanApplication | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedDocLoan, setSelectedDocLoan] = useState<LoanApplication | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string>('');
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);

  const openDocumentModal = async (loan: LoanApplication) => {
    setSelectedDocLoan(loan);
    setIsLoadingDoc(true);
    setDocPreviewUrl('');
    const fullUrl = await fetchLoanDocument(loan.certificateDocumentUrl);
    setDocPreviewUrl(fullUrl || '');
    setIsLoadingDoc(false);
  };

  // Bug 1 fix: Guard de autorización basado en rol real de Firestore
  useEffect(() => {
    if (loading) return; // Esperar que Firestore resuelva el perfil
    if (!authUser) {
      router.replace('/login');
      return;
    }
    if (profile && profile.role !== 'admin') {
      // Estudiante autenticado que intenta acceder a /admin → redirigir al dashboard
      router.replace('/dashboard');
    }
  }, [authUser, profile, loading, router]);

  useEffect(() => {
    const unsubscribe = subscribeToAllLoans(setAllLoans);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-page)' }}>
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--brand)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--ink-3)' }}>Cargando consola administrativa...</p>
        </div>
      </div>
    );
  }

  const filteredLoans = allLoans.filter((loan) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return loan.status === 'pending';
    if (filterStatus === 'active') return ['active', 'approved', 'overdue'].includes(loan.status);
    if (filterStatus === 'rejected') return loan.status === 'rejected';
    return true;
  });

  const pendingCount  = allLoans.filter(l => l.status === 'pending').length;
  const activeCount   = allLoans.filter(l => ['active', 'approved', 'overdue'].includes(l.status)).length;
  const rejectedCount = allLoans.filter(l => l.status === 'rejected').length;
  const totalCapital  = allLoans
    .filter(l => ['active', 'approved', 'overdue', 'pending'].includes(l.status))
    .reduce((sum, l) => sum + l.requestedAmount, 0);

  const handleApprove = async (loan: LoanApplication) => {
    if (!loan.id) return;
    if (!confirm(`¿Aprobar crédito de $${loan.requestedAmount}.00 USD para ${loan.studentName}?`)) return;
    setProcessingId(loan.id);
    const res = await adminApproveLoan(loan.id);
    setProcessingId(null);
    if (res.success) alert(`Crédito de ${loan.studentName} aprobado.`);
    else alert(`Error: ${res.error}`);
  };

  const handleDelete = async (loan: LoanApplication) => {
    if (!loan.id) return;
    if (!confirm(`¿ESTÁS SEGURO DE ELIMINAR EL EXPEDIENTE DE PRUEBA de ${loan.studentName} ($${loan.requestedAmount}.00 USD)? Esta acción limpiará la base de datos de inmediato.`)) return;
    setProcessingId(loan.id);
    const res = await deleteLoanApplication(loan.id);
    setProcessingId(null);
    if (!res.success) {
      alert(`Error al eliminar: ${res.error}`);
    }
  };

  const handlePurgeAll = async () => {
    if (allLoans.length === 0) {
      alert('La base de datos ya está completamente limpia. No hay créditos que eliminar.');
      return;
    }
    if (!confirm(`⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODOS LOS CRÉDITOS (${allLoans.length} en total) DE LA BASE DE DATOS DE FIREBASE?\n\nEsta acción purgará todas las solicitudes y archivos adjuntos del sistema para que inicies tu demostración oficial desde cero.`)) return;
    setProcessingId('PURGE_ALL');
    const res = await adminPurgeAllLoans();
    setProcessingId(null);
    if (res.success) {
      alert(`✅ ¡Sistema completamente limpio! Se borraron ${res.deletedCount} expedientes y sus documentos de la base de datos.`);
    } else {
      alert(`Error al purgar los créditos: ${res.error}`);
    }
  };

  const openRejectionModal = (loan: LoanApplication) => {
    setRejectionModalLoan(loan);
    setRejectionReasonInput('');
    setSelectedPreset('');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalLoan?.id) return;
    const finalMessage = (selectedPreset && selectedPreset !== 'custom')
      ? `${selectedPreset}. ${rejectionReasonInput}`.trim()
      : rejectionReasonInput.trim();
    if (!finalMessage) {
      alert('Por favor ingresa el motivo de rechazo para notificar al estudiante.');
      return;
    }
    setProcessingId(rejectionModalLoan.id);
    const res = await adminRejectLoan(rejectionModalLoan.id, finalMessage);
    setProcessingId(null);
    if (res.success) {
      setRejectionModalLoan(null);
    } else {
      alert(`Error al rechazar: ${res.error}`);
    }
  };

  const presetReasons = [
    'El promedio declarado no coincide con los archivos oficiales de secretaría UTB',
    'El garante solidario propuesto mantiene cuotas pendientes o en mora',
    'El garante de estudiante de primer semestre debe cursar 2do semestre o posterior',
    'El historial crediticio registra retrasos recurrentes no subsanados',
  ];

  const FILTER_TABS = [
    { id: 'pending' as const,  label: 'En revisión', count: pendingCount  },
    { id: 'active'  as const,  label: 'Activos',      count: activeCount   },
    { id: 'rejected' as const, label: 'Devueltos',    count: rejectedCount },
    { id: 'all'     as const,  label: 'Todos',        count: allLoans.length },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--surface-page)', color: 'var(--ink-1)' }}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          background: 'color-mix(in srgb, var(--surface-0) 92%, transparent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span
                className="text-[11px] font-bold uppercase tracking-wider block leading-none"
                style={{ color: 'var(--brand)' }}
              >
                Consola Administrativa
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>
                Secretaría UTB — Control del Fondo
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="hidden sm:block text-xs font-medium"
              style={{ color: 'var(--ink-3)' }}
            >
              {authUser?.email}
            </span>
            <ThemeToggleButton />
            <button
              onClick={() => logout().then(() => router.push('/login'))}
              className="btn-ghost"
              style={{ height: '34px', padding: '0 14px', fontSize: '13px' }}
            >
              <LogOut className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'En revisión',    value: pendingCount,  unit: 'solicitudes', icon: <Clock className="w-4 h-4" />,      color: 'var(--warning)' },
            { label: 'Créditos activos', value: activeCount, unit: 'en curso',   icon: <DollarSign className="w-4 h-4" />, color: 'var(--brand)'   },
            { label: 'Devueltos',      value: rejectedCount, unit: 'expedientes', icon: <XCircle className="w-4 h-4" />,    color: 'var(--danger)'  },
            { label: 'Capital activo', value: `$${totalCapital}`, unit: 'USD comprometido', icon: <BarChart3 className="w-4 h-4" />, color: 'var(--info)' },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
                  {kpi.label}
                </p>
                <span style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
              <div>
                <p
                  className="text-2xl font-extrabold tabular-nums leading-none"
                  style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}
                >
                  {kpi.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>{kpi.unit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs principales */}
        <div
          className="flex gap-0.5 border-b pb-px overflow-x-auto"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {[
            { id: 'expedientes' as const, label: 'Mesa de expedientes', icon: <FileText className="w-4 h-4" />, count: pendingCount },
            { id: 'usuarios'    as const, label: 'Directorio de Usuarios', icon: <Users className="w-4 h-4" /> },
            { id: 'analytics'   as const, label: 'Analítica BI',        icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg shrink-0 transition-all duration-150 border-b-2 -mb-px"
                style={{
                  borderBottomColor: isActive ? 'var(--brand)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--ink-3)',
                  background: isActive ? 'var(--brand-muted)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className="badge badge-warning"
                    style={{ fontSize: '11px' }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div className="animate-fadein">
            <AnalyticsBI allLoans={allLoans} />
          </div>
        )}

        {/* Tab: Directorio de Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="animate-fadein">
            <UserListTab allLoans={allLoans} />
          </div>
        )}

        {/* Tab: Expedientes */}
        {activeTab === 'expedientes' && (
          <div className="space-y-5 animate-fadein">

            {/* Zona de Limpieza para Demostraciones (Sólo Admin) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 mb-2 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Zona de Limpieza y Preparación de Demostración
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                  Borra simultáneamente todos los expedientes y archivos de prueba guardados en Firebase para iniciar tu presentación oficial desde cero.
                </p>
              </div>
              <button
                type="button"
                disabled={processingId === 'PURGE_ALL' || allLoans.length === 0}
                onClick={handlePurgeAll}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition shrink-0 shadow-md hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                style={{ background: '#DC2626' }}
              >
                {processingId === 'PURGE_ALL' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar TODOS los créditos ({allLoans.length})
              </button>
            </div>

            {/* Barra de filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: 'var(--ink-3)' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--ink-1)' }}>
                  Solicitudes de crédito
                </h3>
              </div>
              <div className="flex overflow-x-auto gap-1.5 text-xs font-medium">
                {FILTER_TABS.map((f) => {
                  const isActive = filterStatus === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFilterStatus(f.id)}
                      className="py-2 px-3.5 rounded-lg shrink-0 transition-all"
                      style={{
                        background: isActive ? 'var(--brand-muted)' : 'var(--surface-1)',
                        color: isActive ? 'var(--brand)' : 'var(--ink-2)',
                        border: isActive ? `1.5px solid color-mix(in srgb, var(--brand) 30%, transparent)` : '1.5px solid transparent',
                        fontWeight: isActive ? '600' : '400',
                      }}
                    >
                      {f.label} ({f.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de solicitudes */}
            {filteredLoans.length === 0 ? (
              <div className="card p-16 text-center space-y-3">
                <FileText className="w-10 h-10 mx-auto opacity-30" style={{ color: 'var(--ink-3)' }} />
                <h4 className="text-base font-semibold" style={{ color: 'var(--ink-1)' }}>
                  No hay solicitudes en esta vista
                </h4>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink-2)' }}>
                  Selecciona otro filtro para ver otros expedientes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLoans.map((loan) => {
                  const isProcessing = processingId === loan.id;
                  const isNovato = loan.semester === 1;
                  const garanteValido = !isNovato || (loan.guarantorSemester && loan.guarantorSemester >= 2);
                  const statusInfo = STATUS_MAP[loan.status] || { label: loan.status, badgeClass: 'badge badge-neutral' };

                  return (
                    <div
                      key={loan.id}
                      className="card overflow-hidden transition-shadow duration-200 hover:shadow-md"
                    >
                      {/* Cabecera del expediente */}
                      <div
                        className="px-5 py-4 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-mono"
                              style={{ color: 'var(--ink-3)' }}
                            >
                              #{loan.id?.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={statusInfo.badgeClass}>{statusInfo.label}</span>
                            <span className="text-xs" style={{ color: 'var(--ink-3)' }}>
                              {new Date(loan.createdAt || Date.now()).toLocaleDateString('es-EC')}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <h4 className="text-lg font-bold" style={{ color: 'var(--ink-1)' }}>
                              {loan.studentName}
                            </h4>
                            <span
                              className="text-xs px-2 py-0.5 rounded-lg font-medium"
                              style={{ background: 'var(--surface-1)', color: 'var(--ink-2)' }}
                            >
                              {loan.career} · {loan.semester}º Sem.
                            </span>
                          </div>
                          <div
                            className="flex flex-wrap items-center gap-5 text-xs"
                            style={{ color: 'var(--ink-2)' }}
                          >
                            <span>
                              Cédula:{' '}
                              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                                {loan.studentCedula || 'No registrada'}
                              </strong>
                            </span>
                            {loan.certificateDocumentUrl ? (
                              <button
                                type="button"
                                onClick={() => openDocumentModal(loan)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-semibold transition-all text-xs cursor-pointer shadow-2xs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Promoción de Notas ({loan.certificateFileName || 'PDF/Img'})</span>
                              </button>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">
                                Sin archivo adjunto
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Monto */}
                        <div
                          className="text-right p-4 rounded-xl shrink-0"
                          style={{ background: 'var(--surface-1)' }}
                        >
                          <p className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>Monto solicitado</p>
                          <p
                            className="text-2xl font-extrabold tabular-nums mt-0.5"
                            style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}
                          >
                            ${loan.requestedAmount}.00
                            <span className="text-sm font-normal ml-1" style={{ color: 'var(--ink-3)' }}>USD</span>
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--brand)' }}>
                            {loan.durationWeeks} semanas
                          </p>
                        </div>
                      </div>

                      {/* Garante y motivo de rechazo */}
                      <div className="px-5 py-3 space-y-3">
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl"
                          style={{ background: 'var(--surface-1)' }}
                        >
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-2)' }}>
                            <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />
                            <div>
                              <span className="font-semibold" style={{ color: 'var(--ink-1)' }}>
                                {loan.guarantorName || 'Garante no identificado'}
                              </span>
                              <span className="ml-2">· Cédula: {loan.guarantorCedula || 'N/A'} · {loan.guarantorSemester || 2}º Sem.</span>
                            </div>
                          </div>
                          {garanteValido ? (
                            <span className="badge badge-success shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Garante válido
                            </span>
                          ) : (
                            <span className="badge badge-danger shrink-0">
                              <AlertCircle className="w-3 h-3" /> Garante no cumple requisito
                            </span>
                          )}
                        </div>

                        {loan.status === 'rejected' && loan.rejectionReason && (
                          <div
                            className="flex items-start gap-3 p-3.5 rounded-xl text-sm border"
                            style={{
                              background: 'var(--danger-bg)',
                              borderColor: 'color-mix(in srgb, var(--danger) 20%, transparent)',
                            }}
                          >
                            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                            <div>
                              <span className="font-semibold block" style={{ color: 'var(--danger)' }}>
                                Dictamen enviado al estudiante:
                              </span>
                              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                                {loan.rejectionReason}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Barra de acciones (disponible en todos los estados para limpieza de demos y gestión) */}
                        <div
                          className="pt-3 border-t flex flex-wrap items-center justify-between gap-3"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDelete(loan)}
                            className="btn-ghost flex items-center gap-1.5 transition-colors duration-150 hover:bg-red-500/10"
                            style={{ height: '36px', padding: '0 12px', fontSize: '12px', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            title="Eliminar este registro de Firebase (Limpieza de pruebas)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar / Limpiar prueba
                          </button>

                          {loan.status === 'pending' && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => openRejectionModal(loan)}
                                className="btn-ghost"
                                style={{ height: '38px', padding: '0 16px', fontSize: '13px', color: 'var(--danger)', borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)' }}
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar y notificar
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApprove(loan)}
                                className="btn-primary"
                                style={{ height: '38px', padding: '0 20px', fontSize: '13px' }}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                                Aprobar y desembolsar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de rechazo */}
      {rejectionModalLoan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="max-w-xl w-full rounded-2xl overflow-hidden animate-fadein"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Cabecera del modal */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--danger-bg)' }}
                >
                  <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--ink-1)' }}>
                    Rechazar solicitud de {rejectionModalLoan.studentName}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
                    ${rejectionModalLoan.requestedAmount}.00 USD · #{rejectionModalLoan.id?.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalLoan(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-light transition hover:bg-[var(--surface-1)]"
                style={{ color: 'var(--ink-3)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-5">
              {/* Razones predefinidas */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  1. Causa según reglamento (opcional):
                </label>
                <div className="space-y-1.5">
                  {presetReasons.map((preset, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl text-xs cursor-pointer transition"
                      style={{
                        border: `1.5px solid ${selectedPreset === preset ? 'var(--brand)' : 'var(--border-subtle)'}`,
                        background: selectedPreset === preset ? 'var(--brand-muted)' : 'var(--surface-1)',
                        color: 'var(--ink-2)',
                      }}
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
                        className="mt-0.5 shrink-0"
                        style={{ accentColor: 'var(--brand)' }}
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                  <label
                    className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold cursor-pointer transition"
                    style={{
                      border: `1.5px solid ${selectedPreset === 'custom' ? 'var(--brand)' : 'var(--border-subtle)'}`,
                      background: selectedPreset === 'custom' ? 'var(--brand-muted)' : 'var(--surface-1)',
                      color: 'var(--ink-2)',
                    }}
                  >
                    <input
                      type="radio"
                      name="preset-reason"
                      value="custom"
                      checked={selectedPreset === 'custom'}
                      onChange={() => { setSelectedPreset('custom'); setRejectionReasonInput(''); }}
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    Redactar motivo personalizado
                  </label>
                </div>
              </div>

              {/* Mensaje final */}
              <div className="space-y-2">
                <label
                  htmlFor="custom-reason"
                  className="block text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--ink-2)' }}
                >
                  2. Mensaje que recibirá el estudiante:
                </label>
                <textarea
                  id="custom-reason"
                  rows={3}
                  required
                  placeholder="Explica clara y respetuosamente el motivo y cómo el estudiante puede corregirlo..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs leading-relaxed outline-none transition"
                  style={{
                    border: `1.5px solid var(--border-strong)`,
                    background: 'var(--surface-0)',
                    color: 'var(--ink-1)',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                />
              </div>

              <div
                className="pt-4 flex items-center justify-end gap-3 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <button
                  type="button"
                  onClick={() => setRejectionModalLoan(null)}
                  className="btn-ghost"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectionModalLoan.id || !rejectionReasonInput.trim()}
                  className="btn-primary"
                  style={{ height: '38px', padding: '0 20px', fontSize: '13px', background: 'var(--danger)' }}
                >
                  {processingId === rejectionModalLoan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visor del Certificado o Promoción de Notas */}
      {selectedDocLoan && selectedDocLoan.certificateDocumentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadein">
          <div 
            className="w-full max-w-4xl rounded-3xl p-6 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-slate-700"
            style={{ background: 'var(--surface-0)', color: 'var(--ink-1)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">
                    Promoción de Notas — {selectedDocLoan.studentName}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--ink-3)' }}>
                    Cédula: {selectedDocLoan.studentCedula || 'N/D'} · Archivo: {selectedDocLoan.certificateFileName || 'promocion_notas_utb.pdf'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDocLoan(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900/50 rounded-2xl p-2 min-h-[450px]">
              {isLoadingDoc ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-8">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                  <p className="text-sm text-slate-300 font-semibold">Cargando documento y verificando calificaciones...</p>
                </div>
              ) : docPreviewUrl.startsWith('data:image') || selectedDocLoan.certificateFileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img 
                  src={docPreviewUrl} 
                  alt="Promoción de notas del estudiante" 
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md"
                />
              ) : (
                <iframe
                  src={docPreviewUrl}
                  className="w-full h-[65vh] rounded-xl border-0 bg-white"
                  title="Visor de PDF de Notas"
                />
              )}
            </div>

            <div className="pt-4 mt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <a
                href={docPreviewUrl || '#'}
                download={selectedDocLoan.certificateFileName || 'promocion_notas_utb.pdf'}
                className="btn-primary flex items-center gap-2"
                style={{ height: '40px', padding: '0 18px', fontSize: '13px', textDecoration: 'none', opacity: isLoadingDoc ? 0.5 : 1 }}
              >
                <FileText className="w-4 h-4" />
                Descargar copia local
              </a>
              <button
                type="button"
                onClick={() => setSelectedDocLoan(null)}
                className="btn-ghost"
                style={{ height: '40px', padding: '0 20px', fontSize: '13px' }}
              >
                Cerrar visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
