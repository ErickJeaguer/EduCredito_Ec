'use client';

import React from 'react';
import { Zap, Clock, ArrowUpRight, TrendingUp } from 'lucide-react';

interface CreditWalletHeroProps {
  studentName: string;
  totalDebt: number;       // Monto total del crédito
  paidAmount: number;      // Lo que ya se pagó
  remainingBalance: number; // Saldo pendiente
  nextDueDate: string;     // "15 de agosto"
  nextInstallmentAmount: number;
  durationWeeks: number;
  paidInstallments: number;
  onPayClick: () => void;
  onSimulateClick: () => void;
  hasActiveCredit: boolean;
}

export const CreditWalletHero: React.FC<CreditWalletHeroProps> = ({
  studentName,
  totalDebt,
  paidAmount,
  remainingBalance,
  nextDueDate,
  nextInstallmentAmount,
  durationWeeks,
  paidInstallments,
  onPayClick,
  onSimulateClick,
  hasActiveCredit,
}) => {
  const progress = totalDebt > 0 ? Math.round((paidAmount / totalDebt) * 100) : 0;
  const firstName = studentName.split(' ')[0];

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-lg"
      style={{
        background: '#090E17',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        minHeight: '260px',
      }}
    >
      {/* Resplandor radial de fondo */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 85% 20%, rgba(0, 196, 140, 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(37, 99, 235, 0.12) 0%, transparent 70%)
          `,
        }}
      />

      {/* Líneas geométricas decorativas sutiles */}
      <div
        className="pointer-events-none absolute top-0 right-0 opacity-[0.04]"
        aria-hidden
        style={{ width: '320px', height: '320px' }}
      >
        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="320" cy="0" r="200" stroke="white" strokeWidth="1"/>
          <circle cx="320" cy="0" r="150" stroke="white" strokeWidth="1"/>
          <circle cx="320" cy="0" r="100" stroke="white" strokeWidth="1"/>
          <circle cx="320" cy="0" r="50" stroke="white" strokeWidth="1"/>
        </svg>
      </div>

      <div className="relative p-6 sm:p-8 h-full flex flex-col gap-6">

        {/* Fila superior: Saludo + Badge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Hola, {firstName} 👋
            </p>
            <h2
              className="text-lg font-bold mt-0.5"
              style={{ color: 'rgba(255,255,255,0.95)' }}
            >
              {hasActiveCredit ? 'Tu crédito activo' : 'Sin créditos activos'}
            </h2>
          </div>
          {hasActiveCredit && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
              style={{
                background: 'rgba(0, 196, 140, 0.15)',
                color: '#00C48C',
                border: '1px solid rgba(0, 196, 140, 0.25)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-brand"
                style={{ background: '#00C48C' }}
              />
              En curso
            </div>
          )}
        </div>

        {/* Cifra central — Saldo pendiente */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            {hasActiveCredit ? (
              <>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Saldo pendiente
                </p>
                <div
                  className="tabular-nums leading-none"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                    fontWeight: '800',
                    letterSpacing: '-0.03em',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-family-mono, monospace)',
                  }}
                >
                  ${remainingBalance.toFixed(2)}
                  <span
                    className="text-xl font-normal ml-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    USD
                  </span>
                </div>

                {/* Barra de progreso de amortización */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {paidInstallments} de {durationWeeks} cuotas pagadas
                    </span>
                    <span style={{ color: '#00C48C', fontWeight: '700' }}>
                      {progress}% pagado
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--brand) 0%, #00C48C 100%)',
                        boxShadow: '0 0 8px rgba(0, 196, 140, 0.5)',
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-3xl font-extrabold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  $0.00 USD
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Cupo disponible: <strong style={{ color: '#00C48C' }}>$30.00 USD</strong>
                </p>
              </div>
            )}
          </div>

          {/* Widget de próximo vencimiento */}
          {hasActiveCredit && (
            <div
              className="shrink-0 p-4 rounded-2xl min-w-[160px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Próximo pago
                </span>
              </div>
              <p
                className="text-lg font-extrabold tabular-nums"
                style={{ color: '#FFFFFF', fontFamily: 'var(--font-family-mono, monospace)' }}
              >
                ${nextInstallmentAmount.toFixed(2)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {nextDueDate}
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          {hasActiveCredit ? (
            <button
              onClick={onPayClick}
              className="flex-1 flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '48px',
                background: '#00C48C',
                color: '#0D1421',
                fontSize: '14px',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 16px rgba(0, 196, 140, 0.35)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#00A876';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#00C48C';
              }}
            >
              <Zap className="w-4 h-4 fill-current" />
              Pagar cuota ahora
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSimulateClick}
              className="flex-1 flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '48px',
                background: '#00C48C',
                color: '#0D1421',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(0, 196, 140, 0.35)',
              }}
            >
              <TrendingUp className="w-4 h-4" />
              Solicitar nuevo crédito
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSimulateClick}
            className="sm:w-auto flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150"
            style={{
              height: '48px',
              padding: '0 20px',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')}
          >
            Simular crédito
          </button>
        </div>
      </div>
    </div>
  );
};
