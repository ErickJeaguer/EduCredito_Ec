'use client';

import React, { useEffect } from 'react';
import type { PaymentReceipt } from '../../types/credit';
import {
  GraduationCap, CheckCircle2, ShieldCheck, Printer, X,
  Download, Calendar, User, Hash, Sparkles, CreditCard
} from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!receipt) return null;

  const formattedDate = new Date(receipt.paidAt).toLocaleString('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const transactionId = receipt.referenceNumber.replace(/\D/g, '').slice(0, 12).padStart(12, '0');
  const isFullyPaid = receipt.remainingLoanBalance === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7, 11, 19, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md animate-fadein"
        style={{
          background: 'var(--surface-0)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Franja superior degradado institucional */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, var(--brand) 0%, #00C48C 50%, var(--accent) 100%)',
          }}
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'var(--ink-3)', background: 'var(--surface-1)' }}
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero — Estado del pago */}
        <div
          className="px-6 pt-6 pb-5 text-center"
          style={{ borderBottom: `1px solid var(--border-subtle)` }}
        >
          {/* Ícono animado */}
          <div className="flex justify-center mb-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center animate-check-pop"
              style={{ background: 'var(--success-bg)', border: `2px solid color-mix(in srgb, var(--success) 30%, transparent)` }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--success)' }} />
            </div>
          </div>

          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: 'var(--brand)' }}
          >
            Pago Verificado
          </p>
          <p
            className="text-[11px] font-medium"
            style={{ color: 'var(--ink-3)' }}
          >
            Cuota #{receipt.weekNumber} · Amortización semanal
          </p>

          {/* Monto principal */}
          <div className="mt-4">
            <p
              className="text-[42px] font-extrabold tracking-tight tabular-nums leading-none"
              style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-family-mono, monospace)' }}
            >
              ${receipt.amount.toFixed(2)}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-3)' }}>USD</p>
          </div>

          {/* Badge liquidado total */}
          {isFullyPaid && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-3 text-sm font-semibold"
              style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}
            >
              <Sparkles className="w-4 h-4" />
              ¡Crédito liquidado en su totalidad!
            </div>
          )}
        </div>

        {/* Cuerpo del recibo */}
        <div className="px-6 py-5 space-y-4">

          {/* Número de transacción y fecha */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--surface-1)' }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium" style={{ color: 'var(--ink-3)' }}>
                <Hash className="w-3.5 h-3.5" />
                ID de transacción
              </span>
              <span
                className="font-bold tracking-widest"
                style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-family-mono, monospace)', fontSize: '11px' }}
              >
                {transactionId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium" style={{ color: 'var(--ink-3)' }}>
                <Calendar className="w-3.5 h-3.5" />
                Fecha y hora
              </span>
              <span className="font-semibold" style={{ color: 'var(--ink-1)' }}>
                {formattedDate}
              </span>
            </div>
            <div className="flex items-start justify-between text-xs">
              <span className="flex items-center gap-2 font-medium shrink-0" style={{ color: 'var(--ink-3)' }}>
                <User className="w-3.5 h-3.5" />
                Titular
              </span>
              <span className="font-semibold text-right" style={{ color: 'var(--ink-1)' }}>
                {receipt.studentName}
                <br />
                <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-family-mono, monospace)', fontSize: '10px' }}>
                  {receipt.studentCedula}
                </span>
              </span>
            </div>
          </div>

          {/* Línea troquelada */}
          <div className="relative py-1">
            <hr className="divider-dashed" />
            <div
              className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
              style={{ background: 'var(--surface-page)', border: '1.5px solid var(--border-strong)' }}
            />
            <div
              className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
              style={{ background: 'var(--surface-page)', border: '1.5px solid var(--border-strong)' }}
            />
          </div>

          {/* Desglose financiero */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Capital principal amortizado</span>
              <span className="font-mono font-medium" style={{ color: 'var(--ink-1)' }}>
                ${receipt.principal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--ink-2)' }}>
              <span>Aporte solidario al fondo (8.5% anual)</span>
              <span className="font-mono font-medium" style={{ color: 'var(--brand)' }}>
                ${receipt.interest.toFixed(2)}
              </span>
            </div>
            <div
              className="flex justify-between pt-2.5 border-t font-semibold text-sm"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--ink-1)' }}
            >
              <span>Saldo deudor residual</span>
              <span
                className="font-mono"
                style={{ color: isFullyPaid ? 'var(--success)' : 'var(--ink-1)' }}
              >
                ${receipt.remainingLoanBalance.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Sello de seguridad */}
          <div
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium"
            style={{
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid color-mix(in srgb, var(--success) 15%, transparent)',
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            Documento firmado electrónicamente · SSL Módulo 10
          </div>

          {/* QR decorativo + referencia */}
          <div
            className="flex items-center gap-4 p-3.5 rounded-xl"
            style={{ background: 'var(--surface-1)' }}
          >
            {/* QR simulado */}
            <div
              className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
              style={{ background: 'var(--surface-2)' }}
            >
              <svg viewBox="0 0 40 40" className="w-10 h-10" style={{ color: 'var(--ink-1)' }}>
                {/* QR pattern decorativo */}
                <rect x="2" y="2" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="5" width="6" height="6" rx="0.5" fill="currentColor"/>
                <rect x="26" y="2" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <rect x="29" y="5" width="6" height="6" rx="0.5" fill="currentColor"/>
                <rect x="2" y="26" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="29" width="6" height="6" rx="0.5" fill="currentColor"/>
                <rect x="18" y="2" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="8" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="24" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="30" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="24" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="24" y="24" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="30" y="30" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="30" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="36" y="24" width="2" height="8" rx="0.5" fill="currentColor"/>
                <rect x="2" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="8" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="2" y="24" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="8" y="24" width="4" height="4" rx="0.5" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
                Ref. UTB-{receipt.referenceNumber.slice(-6)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
                Código de verificación oficial
              </p>
              <div
                className="flex items-center gap-1 mt-1"
                style={{ color: 'var(--brand)' }}
              >
                <GraduationCap className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wide">UTB Babahoyo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — Acciones */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3 border-t"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--surface-1)',
          }}
        >
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ height: '38px', padding: '0 16px', fontSize: '13px', flex: 1 }}
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary"
            style={{ height: '38px', padding: '0 16px', fontSize: '13px', flex: 2 }}
          >
            <Download className="w-4 h-4" />
            Descargar recibo
          </button>
        </div>
      </div>
    </div>
  );
};
