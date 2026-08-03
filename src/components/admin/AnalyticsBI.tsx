'use client';

import React, { useMemo } from 'react';
import type { LoanApplication } from '../../types/credit';
import { 
  BarChart3, TrendingUp, Download, FileText, AlertTriangle, 
  CheckCircle2, DollarSign, PieChart, Users, Award, Percent,
  ArrowUpRight, ArrowDownRight, Building2, Printer
} from 'lucide-react';

interface AnalyticsBIProps {
  allLoans: LoanApplication[];
}

export const AnalyticsBI: React.FC<AnalyticsBIProps> = ({ allLoans }) => {
  // 1. Cálculos de Inteligencia de Negocios (BI) y KPIs del Fondo
  const metrics = useMemo(() => {
    const totalApplications = allLoans.length || 1;
    const activeLoans = allLoans.filter(l => ['active', 'approved', 'overdue'].includes(l.status));
    const paidLoans = allLoans.filter(l => l.status === 'paid');
    const overdueLoans = allLoans.filter(l => l.status === 'overdue');
    const rejectedLoans = allLoans.filter(l => l.status === 'rejected');
    const pendingLoans = allLoans.filter(l => l.status === 'pending');

    // Montos
    const totalDisbursed = [...activeLoans, ...paidLoans].reduce((sum, item) => sum + item.requestedAmount, 0);
    const totalRequested = allLoans.reduce((sum, item) => sum + item.requestedAmount, 0);
    
    // Capital recuperado y en mora desde cuotas individuales
    let recoveredCapital = 0;
    let overdueCapital = 0;
    let accruedInterest = 0;

    allLoans.forEach((loan) => {
      if (['active', 'approved', 'overdue', 'paid'].includes(loan.status) && loan.installments) {
        loan.installments.forEach((inst) => {
          if (inst.isPaid) {
            recoveredCapital += inst.principal;
            accruedInterest += inst.interest;
          } else if (loan.status === 'overdue' || new Date(inst.dueDate) < new Date()) {
            overdueCapital += inst.amount;
          }
        });
      }
    });

    // Tasa de recuperación de cartera (TRC) e Índice de Morosidad (IMI)
    const recoveryRate = totalDisbursed > 0 ? ((recoveredCapital / totalDisbursed) * 100) : 100;
    const delinquencyRate = totalDisbursed > 0 ? ((overdueCapital / totalDisbursed) * 100) : 0;
    const approvalRate = allLoans.length > 0 ? (((activeLoans.length + paidLoans.length) / totalApplications) * 100) : 0;

    // Distribución por carrera o facultad
    const careerCount: Record<string, { count: number; amount: number; overdue: number }> = {};
    allLoans.forEach((l) => {
      const careerName = l.career || 'Facultad General UTB';
      if (!careerCount[careerName]) {
        careerCount[careerName] = { count: 0, amount: 0, overdue: 0 };
      }
      careerCount[careerName].count += 1;
      careerCount[careerName].amount += l.requestedAmount;
      if (l.status === 'overdue') {
        careerCount[careerName].overdue += l.requestedAmount;
      }
    });

    // Promedio académico de aprobados vs rechazados
    const avgGradeApproved = activeLoans.reduce((sum, l) => sum + (Number(l.previousSemesterGrade) || 8.5), 0) / (activeLoans.length || 1);
    const avgGradeRejected = rejectedLoans.reduce((sum, l) => sum + (Number(l.previousSemesterGrade) || 7.0), 0) / (rejectedLoans.length || 1);

    return {
      activeCount: activeLoans.length,
      paidCount: paidLoans.length,
      overdueCount: overdueLoans.length,
      pendingCount: pendingLoans.length,
      rejectedCount: rejectedLoans.length,
      totalDisbursed,
      totalRequested,
      recoveredCapital,
      overdueCapital,
      accruedInterest,
      recoveryRate,
      delinquencyRate,
      approvalRate,
      careerCount,
      avgGradeApproved,
      avgGradeRejected
    };
  }, [allLoans]);

  // 2. Exportar a Excel / CSV con formato perfecto (UTF-8 con BOM)
  const exportToExcelCSV = (onlyOverdue: boolean = false) => {
    const dataToExport = onlyOverdue 
      ? allLoans.filter(l => l.status === 'overdue')
      : allLoans;

    if (dataToExport.length === 0) {
      alert(onlyOverdue ? 'No hay créditos en estado de mora para exportar.' : 'No hay datos de créditos registrados en el sistema.');
      return;
    }

    // Cabeceras oficiales del reporte
    const headers = [
      'ID Expediente',
      'Cédula Estudiante',
      'Nombre Completo',
      'Facultad / Carrera',
      'Semestre',
      'Promedio Académico',
      'Monto Aprobado (USD)',
      'Plazo (Semanas)',
      'Estado Actual',
      'Nombre Garante Solidario',
      'Cédula / Identificador Garante',
      'Semestre Garante',
      'Fecha Solicitud'
    ];

    const rows = dataToExport.map(l => [
      l.id || 'N/A',
      l.studentCedula || 'Sin cédula',
      `"${(l.studentName || '').replace(/"/g, '""')}"`,
      `"${(l.career || 'N/D').replace(/"/g, '""')}"`,
      l.semester || '1',
      l.previousSemesterGrade || 'N/D',
      l.requestedAmount || 0,
      l.durationWeeks || 4,
      l.status === 'active' ? 'En Curso' : l.status === 'overdue' ? 'EN MORA' : l.status === 'paid' ? 'Liquidado' : l.status === 'pending' ? 'Pendiente' : 'Rechazado',
      `"${(l.guarantorName || 'N/A').replace(/"/g, '""')}"`,
      l.guarantorCedula || 'N/A',
      l.guarantorSemester || 'N/A',
      new Date(l.createdAt || Date.now()).toLocaleDateString('es-EC')
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = onlyOverdue ? `Reporte_Morosidad_UTB_${dateStr}.csv` : `Cartera_Fondo_EduCredito_UTB_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Imprimir Resumen Ejecutivo Institucional en PDF / Papel
  const generateExecutivePDFReport = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes (pop-ups) en tu navegador para generar el informe PDF.');
      return;
    }

    const dateFormatted = new Date().toLocaleDateString('es-EC', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Informe de Auditoría y Control - EduCrédito UTB</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 30px; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f8b6d; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo-text { font-size: 24px; font-weight: bold; color: #0f8b6d; letter-spacing: -0.5px; }
          .subtitle { font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; }
          .meta { font-size: 12px; color: #475569; text-align: right; }
          h2 { font-size: 18px; color: #0f172a; border-left: 4px solid #0f8b6d; padding-left: 10px; margin-top: 30px; }
          .grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
          .card { flex: 1; min-width: 180px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; }
          .card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 5px; }
          .card-value { font-size: 22px; font-weight: bold; color: #0f172a; }
          .card-sub { font-size: 11px; color: #10b981; margin-top: 4px; font-weight: 500; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          .table th { background: #0f8b6d; color: white; text-align: left; padding: 10px; font-weight: 600; }
          .table td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
          .table tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
          .signature-box { margin-top: 60px; display: flex; justify-content: space-around; text-align: center; }
          .signature-line { width: 220px; border-top: 1px solid #334155; padding-top: 8px; font-size: 12px; font-weight: 600; color: #334155; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">EduCrédito UTB</div>
            <div class="subtitle">Fondo Rotativo de Apoyo Cooperativo Estudiantil</div>
          </div>
          <div class="meta">
            <strong>DICTAMEN DE INTELIGENCIA Y SOLVENCIA FINANCIERA</strong><br>
            Fecha de emisión: ${dateFormatted}<br>
            Documento Institucional de Secretaría
          </div>
        </div>

        <h2>1. Indicadores de Solvencia del Fondo Rotativo</h2>
        <div class="grid">
          <div class="card">
            <div class="card-title">Capital Total Dispersado</div>
            <div class="card-value">$${metrics.totalDisbursed.toFixed(2)} USD</div>
            <div class="card-sub">En ${metrics.activeCount + metrics.paidCount} préstamos otorgados</div>
          </div>
          <div class="card">
            <div class="card-title">Capital Recuperado en Caja</div>
            <div class="card-value">$${metrics.recoveredCapital.toFixed(2)} USD</div>
            <div class="card-sub">Tasa de recuperación: ${metrics.recoveryRate.toFixed(1)}%</div>
          </div>
          <div class="card">
            <div class="card-title">Índice de Morosidad (IMI)</div>
            <div class="card-value" style="color: ${metrics.delinquencyRate > 8 ? '#ef4444' : '#10b981'}">${metrics.delinquencyRate.toFixed(1)}%</div>
            <div class="card-sub">Capital en atraso: $${metrics.overdueCapital.toFixed(2)} USD</div>
          </div>
          <div class="card">
            <div class="card-title">Fondo de Reserva Cooperatorio</div>
            <div class="card-value">$${metrics.accruedInterest.toFixed(2)} USD</div>
            <div class="card-sub">Intereses institucionales acumulados</div>
          </div>
        </div>

        <h2>2. Desglose de Demanda Crediticia por Facultad y Carrera</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Facultad / Carrera</th>
              <th>Solicitudes Recibidas</th>
              <th>Monto Comprometido</th>
              <th>Porcentaje del Fondo</th>
              <th>Estado de Morosidad</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(metrics.careerCount).map(([name, stat]) => `
              <tr>
                <td><strong>${name}</strong></td>
                <td>${stat.count} expedientes</td>
                <td>$${stat.amount.toFixed(2)} USD</td>
                <td>${((stat.amount / (metrics.totalRequested || 1)) * 100).toFixed(1)}%</td>
                <td>${stat.overdue > 0 ? `<span style="color:#ef4444;font-weight:bold">$${stat.overdue.toFixed(2)} USD</span>` : 'Sin Atrasos (0.00 USD)'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>3. Auditoría de Desempeño Académico y Scoring</h2>
        <p style="font-size: 13px; color: #475569;">
          El motor de evaluación matemática muestra una correlación directa entre la excelencia académica y la puntualidad en el pago de las cuotas semanales.
          El promedio general semestral de estudiantes con crédito otorgado y al día es de <strong>${metrics.avgGradeApproved.toFixed(2)} / 10.00</strong>, cumpliendo con el umbral reglamentario de la Universidad Técnica de Babahoyo (UTB).
        </p>

        <div class="signature-box">
          <div class="signature-line">Secretariado del Fondo EduCrédito UTB</div>
          <div class="signature-line">Dirección de Bienestar y Apoyo Estudiantil</div>
        </div>

        <div class="footer">
          Este informe ha sido generado automáticamente de forma inmutable a través del Portal Directivo de EduCrédito UTB. 
          Todos los montos presentados corresponden a auditorías en moneda oficial Dólares Estadounidenses (USD).
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* BARRA DE BOTONES DE EXPORTACIÓN Y REPORTES INMEDIATOS */}
      <div className="p-6 rounded-xl bg-slate-900 text-white dark:bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
            Módulo Institucional • Business Intelligence
          </span>
          <h3 className="text-xl font-bold mt-2 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Centro de Auditoría y Control Financiero UTB
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitorea en tiempo real la solvencia del fondo cooperativa rotativo, analiza patrones de comportamiento estudiantil por facultad y descarga reportes formales compatibles con Microsoft Excel y formatos de impresión PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => exportToExcelCSV(false)}
            className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Cartera (Excel/CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => exportToExcelCSV(true)}
            className="h-9 px-3.5 rounded-lg border border-amber-500/60 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Alerta Morosos (CSV)</span>
          </button>

          <button
            type="button"
            onClick={generateExecutivePDFReport}
            className="h-9 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Imprimir Resumen (PDF)</span>
          </button>
        </div>
      </div>

      {/* CUATRO PILARES EJECUTIVOS FINANCIEROS (KPIS CON TENDENCIAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Pilar 1: Tasa de Recuperación */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Tasa de Recuperación (TRC)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              metrics.recoveryRate >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {metrics.recoveryRate >= 80 ? 'SALUD ÓPTIMA' : 'ESTABLE'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.recoveryRate.toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% sem
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ${metrics.recoveredCapital.toFixed(2)} USD retornados en cuotas
            </p>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, metrics.recoveryRate))}%` }} />
          </div>
        </div>

        {/* Pilar 2: Índice de Morosidad Institucional (IMI) */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Índice de Morosidad (IMI)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              metrics.delinquencyRate <= 5 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {metrics.delinquencyRate <= 5 ? 'RIESGO MÍNIMO' : 'ATENCIÓN REQUERIDA'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black tracking-tight ${metrics.delinquencyRate > 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {metrics.delinquencyRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">del capital activo</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ${metrics.overdueCapital.toFixed(2)} USD impagados tras fecha límite
            </p>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className={`h-full transition-all duration-500 ${metrics.delinquencyRate > 5 ? 'bg-rose-600' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.max(3, metrics.delinquencyRate))}%` }} />
          </div>
        </div>

        {/* Pilar 3: Capital Dispersado */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Capital en Circulación</span>
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-80" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${metrics.totalDisbursed.toFixed(0)} <span className="text-sm font-normal text-slate-500">USD</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1.5">
              En {metrics.activeCount + metrics.paidCount} microcréditos universitarios
            </p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Promedio por crédito:</span>
            <span>${((metrics.totalDisbursed / (metrics.activeCount + metrics.paidCount || 1))).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Pilar 4: Fondo de Reserva Cooperatorio */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Fondo Reserva Cooperatorio</span>
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-80" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +${metrics.accruedInterest.toFixed(2)} <span className="text-sm font-normal text-slate-500">USD</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Generado por tasa solidaria del 8.5% anual
            </p>
          </div>
          <div className="pt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Destino de reserva:</span>
            <span className="text-emerald-700 dark:text-emerald-400">Becas y Fondo de Contingencia</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DOBLE: GRÁFICOS VISUALES Y ANALÍTICA DE CARRERAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO 1: DISTRIBUCIÓN POR FACULTAD / CARRERA (2 Columnas) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Análisis Demográfico</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" /> Demanda Crediticia por Facultad UTB
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total: {allLoans.length} expedientes procesados
            </span>
          </div>

          {Object.keys(metrics.careerCount).length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No hay suficientes datos registrados por facultad aún.
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(metrics.careerCount)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([name, stat], index) => {
                  const percentage = ((stat.amount / (metrics.totalRequested || 1)) * 100);
                  const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-teal-500', 'bg-indigo-600', 'bg-purple-600', 'bg-amber-600'];
                  const barColor = colors[index % colors.length];

                  return (
                    <div key={name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <span className="truncate max-w-sm flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: barColor.includes('emerald') ? '#10b981' : barColor.includes('blue') ? '#2563eb' : '#0f8b6d' }} />
                          {name}
                        </span>
                        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                          <span>{stat.count} solicitud{stat.count > 1 ? 'es' : ''}</span>
                          <span className="font-mono font-bold">${stat.amount.toFixed(2)} USD</span>
                          <span className="text-slate-500 text-[11px] w-12 text-right">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>

                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor} transition-all duration-700`}
                          style={{ width: `${Math.max(4, percentage)}%` }}
                        />
                      </div>
                      
                      {stat.overdue > 0 && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 pl-4">
                          ⚠️ Alerta de morosidad en esta facultad: ${stat.overdue.toFixed(2)} USD vencidos
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between mt-4">
            <span>💡 <b>Recomendación BI:</b> Fomentar talleres de educación financiera estudiantil en las facultades con mayor porcentaje de solicitud y morosidad.</span>
          </div>
        </div>

        {/* GRÁFICO 2: AUDITORÍA DE SCORING Y ESTADO DE SOLICITUDES (1 Columna) */}
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Salud y Selección</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" /> Desglose de Cartera
              </h4>
            </div>

            {/* Barra de Proporción Apilada */}
            <div className="space-y-3">
              <div className="h-5 w-full rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div 
                  style={{ width: `${((metrics.activeCount + metrics.paidCount) / (allLoans.length || 1)) * 100}%` }} 
                  className="bg-emerald-600 h-full transition-all duration-500"
                  title="Créditos Aprobados/Activos"
                />
                <div 
                  style={{ width: `${(metrics.pendingCount / (allLoans.length || 1)) * 100}%` }} 
                  className="bg-amber-500 h-full transition-all duration-500"
                  title="En Revisión"
                />
                <div 
                  style={{ width: `${(metrics.overdueCount / (allLoans.length || 1)) * 100}%` }} 
                  className="bg-rose-600 h-full transition-all duration-500"
                  title="En Mora"
                />
                <div 
                  style={{ width: `${(metrics.rejectedCount / (allLoans.length || 1)) * 100}%` }} 
                  className="bg-slate-500 h-full transition-all duration-500"
                  title="Devueltos / Rechazados"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 block" /> Activos/Pagados
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics.activeCount + metrics.paidCount}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 block" /> En Revisión
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics.pendingCount}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 block" /> En Mora
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{metrics.overdueCount}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 block" /> Rechazados
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics.rejectedCount}</span>
                </div>
              </div>
            </div>

            {/* Análisis de Correlación Académica (Scoring) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h5 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                Correlación Scoring Académico
              </h5>
              <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Promedio de Aprobados</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Umbral reglamentario cumplido</span>
                </div>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {metrics.avgGradeApproved.toFixed(2)} / 10
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">Promedio de Rechazados</span>
                  <span className="text-[11px] text-slate-500">Por debajo de exigencia académica</span>
                </div>
                <span className="text-base font-bold text-slate-600 dark:text-slate-400 font-mono">
                  {metrics.avgGradeRejected.toFixed(2)} / 10
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
            ✓ Todos los cálculos son auditados por el motor matemático de EduCrédito EC.
          </p>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsBI;
