'use client';

import React from 'react';
import type { PaymentReceipt } from '../../types/credit';
import { GraduationCap, CheckCircle2, ShieldCheck, Printer, X, Download, Landmark, Sparkles, Calendar, User, FileText } from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.paidAt).toLocaleString('es-EC', {
    dateStyle: 'long',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1422] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden transform transition-all">
        
        {/* Franja superior verde institucional */}
        <div className="h-2 bg-emerald-600 dark:bg-emerald-500 w-full" />

        {/* Encabezado Institucional */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" /> Universidad Técnica de Babahoyo
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5 text-slate-900 dark:text-white">
                Comprobante de Caja Solidaria
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar recibo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del recibo */}
        <div className="p-6 space-y-6 text-sm">
          
          {/* Estado del pago */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-950 dark:text-emerald-300 text-sm">
                {receipt.status}
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              AUDITADO
            </span>
          </div>

          {/* Cifra Principal */}
          <div className="text-center py-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Monto Total Abonado
            </span>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
              ${receipt.amount.toFixed(2)} <span className="text-lg font-normal text-slate-500">USD</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Liquidación de Cuota #{receipt.weekNumber} (Amortización Semanal)
            </div>
          </div>

          {/* Detalles de Auditoría */}
          <div className="space-y-2.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> No. de Referencia:
              </span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                {receipt.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha y hora:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formattedDate}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Titular Universitario:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {receipt.studentName} <span className="font-mono text-slate-400">({receipt.studentCedula})</span>
              </span>
            </div>
          </div>

          {/* Desglose Financiero */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Abono a Capital Principal:</span>
              <span className="font-mono font-medium">${receipt.principal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Aporte Solidario al Fondo (8.5% anual):</span>
              <span className="font-mono font-medium">${receipt.interest.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-semibold text-slate-900 dark:text-white">
              <span>Saldo Deudor Residual:</span>
              <span className={`font-mono ${receipt.remainingLoanBalance === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                ${receipt.remainingLoanBalance.toFixed(2)} USD
              </span>
            </div>
            {receipt.remainingLoanBalance === 0 && (
              <div className="mt-2 text-center p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ¡Has liquidado tu crédito en su totalidad! Tu cupo está renovado al 100%.
              </div>
            )}
          </div>

          {/* Sello de seguridad digital */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Documento firmado electrónicamente · Encriptado SSL Módulo 10</span>
          </div>
        </div>

        {/* Pie del Modal: Botones de Acción */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Descargar Recibo
          </button>
        </div>
      </div>
    </div>
  );
};
