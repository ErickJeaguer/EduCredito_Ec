'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, DollarSign, BarChart3, LogOut, Loader2, Award } from 'lucide-react';

export default function AdminDashboardPlaceholder() {
  const { profile, authUser, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!authUser && !loading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Barra superior de Administrador */}
      <header className="border-b border-amber-500/20 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide flex items-center gap-1.5">
                EduCrédito <span className="text-amber-400">Admin</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-normal">Consola de Control UTB</span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => logout().then(() => router.push('/login'))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-2 text-xs font-medium px-3"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Salir del Portal
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/20 shadow-2xl mb-8">
          <h2 className="text-3xl font-extrabold text-white">Portal Administrativo de Microcréditos</h2>
          <p className="text-slate-400 mt-2">Bienvenido, Docente / Administrador ({authUser?.email}). Desde esta estación supervisarás el fondo de préstamos solidarios de la Universidad Técnica de Babahoyo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Alumnos Registrados</p>
              <p className="text-2xl font-bold text-white mt-0.5">Base Activa</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Fondo Crediticio</p>
              <p className="text-2xl font-bold text-white mt-0.5">En Operación</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Motor de Scoring</p>
              <p className="text-2xl font-bold text-white mt-0.5">100% Calibrado</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
