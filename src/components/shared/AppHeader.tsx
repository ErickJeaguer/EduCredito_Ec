'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Bell, ChevronDown, Shield, LogOut, User, Settings } from 'lucide-react';
import { ThemeToggleButton } from '../theme/ThemeProvider';

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: 'student' | 'admin';
  onLogout?: () => void;
  pendingNotifications?: number;
  /** Optional extra right-side content */
  rightSlot?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  userEmail,
  userRole = 'student',
  onLogout,
  pendingNotifications = 0,
  rightSlot,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const initials = userName
    ? userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-200"
      style={{
        background: 'color-mix(in srgb, var(--surface-0) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'var(--brand)' }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span
              className="text-sm font-bold tracking-tight leading-none block"
              style={{ color: 'var(--ink-1)' }}
            >
              EduCrédito <span style={{ color: 'var(--brand)' }}>UTB</span>
            </span>
            <span
              className="text-[10px] leading-none mt-0.5 block"
              style={{ color: 'var(--ink-3)' }}
            >
              {userRole === 'admin' ? 'Consola Administrativa' : 'Portal Estudiantil'}
            </span>
          </div>
        </Link>

        {/* Badge de confianza — centro */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <div
            className="trust-badge"
          >
            <Shield className="w-3.5 h-3.5" />
            Conexión Segura 256-bit UTB
          </div>
        </div>

        {/* Acciones del lado derecho */}
        <div className="flex items-center gap-1.5">

          {/* Búsqueda rápida */}
          {!showSearch ? (
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--ink-3)' }}
              title="Buscar (⌘K)"
              aria-label="Abrir búsqueda"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative animate-fadein">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--ink-3)' }}
              />
              <input
                autoFocus
                type="text"
                placeholder="Buscar expediente..."
                onBlur={() => setShowSearch(false)}
                className="input-bank"
                style={{ width: '220px', height: '36px', paddingLeft: '32px', fontSize: '13px' }}
              />
              <kbd
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: 'var(--surface-1)',
                  color: 'var(--ink-3)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ESC
              </kbd>
            </div>
          )}

          {/* Toggle tema */}
          <ThemeToggleButton />

          {/* Notificaciones */}
          <button
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--ink-3)' }}
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {pendingNotifications > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  background: 'var(--danger)',
                  borderColor: 'var(--surface-0)',
                }}
              />
            )}
          </button>

          {/* Slot personalizado */}
          {rightSlot}

          {/* Avatar con menú desplegable */}
          {userName && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                className="flex items-center gap-2 pl-2 pr-1.5 h-9 rounded-xl transition-colors"
                style={{
                  background: showUserMenu ? 'var(--surface-1)' : 'transparent',
                  border: '1.5px solid transparent',
                  borderColor: showUserMenu ? 'var(--border-strong)' : 'transparent',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--brand)' }}
                >
                  {initials}
                </div>
                <span
                  className="text-sm font-medium hidden sm:block max-w-[100px] truncate"
                  style={{ color: 'var(--ink-1)' }}
                >
                  {userName.split(' ')[0]}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--ink-3)' }}
                />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl overflow-hidden animate-fadein"
                  style={{
                    background: 'var(--surface-0)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                  }}
                >
                  {/* Info del usuario */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink-1)' }}>
                      {userName}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--ink-3)' }}>
                      {userEmail}
                    </p>
                    <div
                      className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                      Cuenta Verificada
                    </div>
                  </div>

                  {/* Menú items */}
                  <div className="py-1.5">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--ink-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User className="w-4 h-4" />
                      Mi perfil
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--ink-2)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </button>
                  </div>

                  <div className="border-t py-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
