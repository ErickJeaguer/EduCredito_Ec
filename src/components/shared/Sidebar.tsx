'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, LayoutDashboard, Calculator, CreditCard,
  History, ShieldCheck, LogOut, ChevronRight, Landmark, Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: SidebarItem[] = [
  { label: 'Mi Expediente', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Simular Crédito', href: '/dashboard', icon: <Calculator className="w-4 h-4" /> },
  { label: 'Mis Obligaciones', href: '/dashboard', icon: <CreditCard className="w-4 h-4" /> },
  { label: 'Historial de Pagos', href: '/dashboard', icon: <History className="w-4 h-4" /> },
  { label: 'Consola Admin', href: '/admin', icon: <Landmark className="w-4 h-4" />, adminOnly: true, badge: 'UTB' },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { profile, authUser, logout } = useAuth();

  const userName = profile?.fullName || authUser?.displayName || authUser?.email?.split('@')[0] || 'Estudiante UTB';
  const userRole = profile?.role || (authUser?.email?.includes('admin') ? 'admin' : 'student');
  const initials = userName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const items = NAV_ITEMS.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <aside
      className="flex flex-col shrink-0 w-64 border-r transition-all duration-200"
      style={{
        background: 'var(--surface-0)',
        borderColor: 'var(--border-subtle)',
        minHeight: 'calc(100vh - 60px)',
      }}
    >
      {/* ── ENCABEZADO ISOTIPO + BADGE UTB BABAHOYO ── */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--brand)' }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold block leading-none" style={{ color: 'var(--ink-1)' }}>
                EduCrédito <span style={{ color: 'var(--brand)' }}>UTB</span>
              </span>
              <span
                className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ background: 'var(--brand-muted)', color: 'var(--brand)' }}
              >
                UTB Babahoyo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVEGACIÓN — INDICADORES TIPO PÍLDORA ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink-3)' }}>
          Navegación Institucional
        </p>
        {items.map((item, index) => {
          const isActive = pathname === item.href && index === 0; // Para visualización clara
          return (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 group"
              style={{
                background: isActive ? 'var(--brand-muted)' : 'transparent',
                color: isActive ? 'var(--brand)' : 'var(--ink-2)',
                fontWeight: isActive ? '700' : '500',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110 duration-150" style={{ color: isActive ? 'var(--brand)' : 'var(--ink-3)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="px-2 py-0.5 text-[10px] font-extrabold rounded-full"
                  style={{ background: 'var(--brand)', color: '#fff' }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Separador */}
        <hr className="my-4" style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Caja de ayuda solidaria */}
        <div
          className="p-3.5 rounded-2xl text-xs space-y-2 relative overflow-hidden"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--ink-1)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
            <span>Fondo Solidario UTB</span>
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            Tu tasa cooperativa del 8.5% anual financia becas y equipamiento para más estudiantes.
          </p>
        </div>
      </nav>

      {/* ── PIE — PERFIL RÁPIDO & CUENTA VERIFICADA ── */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-xs"
            style={{ background: 'var(--brand)' }}
          >
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold truncate" style={{ color: 'var(--ink-1)' }}>
              {userName}
            </p>
            <div
              className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)' }}
            >
              <ShieldCheck className="w-3 h-3" />
              Cuenta Verificada
            </div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 hover:opacity-80"
          style={{ background: 'var(--surface-0)', color: 'var(--danger)', border: '1px solid var(--border-subtle)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
