'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';
import type { UserProfile } from '../../types/user';
import type { LoanApplication } from '../../types/credit';
import {
  Users, Search, Filter, Download, ShieldCheck, UserCheck,
  GraduationCap, Mail, CreditCard, ExternalLink, X, Building2,
  Calendar, Award, CheckCircle2, AlertCircle, Clock, FileSpreadsheet
} from 'lucide-react';

interface UserListTabProps {
  allLoans: LoanApplication[];
}

export const UserListTab: React.FC<UserListTabProps> = ({ allLoans }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserProfile, 'uid'>),
      }));
      setUsers(list);
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar usuarios:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrado de usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cedula || '').includes(searchTerm);

    const matchesFaculty = selectedFaculty === 'ALL' || user.faculty?.includes(selectedFaculty);
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;

    return matchesSearch && matchesFaculty && matchesRole;
  });

  // Métricas
  const totalStudents = users.filter(u => u.role === 'student' || !u.role).length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  // Encontrar préstamos del usuario seleccionado o de un usuario
  const getUserLoans = (user: UserProfile) => {
    return allLoans.filter(
      l => l.studentCedula === user.cedula || l.studentName?.toLowerCase() === user.fullName?.toLowerCase()
    );
  };

  // Función para exportar CSV
  const handleExportCSV = () => {
    const headers = ['Nombres Completos', 'Cédula', 'Correo', 'Facultad', 'Carrera', 'Semestre', 'Rol', 'Créditos Solicitados'];
    const rows = filteredUsers.map(u => {
      const uLoans = getUserLoans(u);
      return [
        `"${u.fullName || 'N/A'}"`,
        `"${u.cedula || 'N/A'}"`,
        `"${u.email || 'N/A'}"`,
        `"${u.faculty || 'N/A'}"`,
        `"${u.career || 'N/A'}"`,
        `"${u.semester || 1}"`,
        `"${u.role === 'admin' ? 'Administrador' : 'Estudiante'}"`,
        `"${uLoans.length}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Directorio_Estudiantes_UTB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="card p-16 text-center space-y-3">
        <Users className="w-8 h-8 animate-bounce mx-auto" style={{ color: 'var(--brand)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--ink-3)' }}>
          Cargando directorio institucional y matrículas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── BARRA DE MÉTRICAS RÁPIDAS ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>
              Comunidad Registrada
            </p>
            <p className="text-3xl font-extrabold mt-1 tabular-nums" style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}>
              {users.length}
            </p>
            <p className="text-xs mt-1 text-emerald-500 font-medium">Verificación Módulo 10 activa</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-muted)', color: 'var(--brand)' }}>
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>
              Estudiantes Activos
            </p>
            <p className="text-3xl font-extrabold mt-1 tabular-nums" style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}>
              {totalStudents}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>Aptos para microcrédito</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>
              Personal de Control
            </p>
            <p className="text-3xl font-extrabold mt-1 tabular-nums" style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}>
              {totalAdmins}
            </p>
            <p className="text-xs mt-1 text-amber-500 font-medium">Gestión administrativa UTB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── BARRA DE FILTROS Y EXPORTACIÓN ────────────────── */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-3)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-bank pl-10"
              style={{ height: '42px', fontSize: '13px' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                style={{ color: 'var(--ink-3)' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Acciones e Indicadores de Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Selector Facultad */}
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="input-bank cursor-pointer"
              style={{ height: '42px', width: 'auto', fontSize: '13px', paddingRight: '28px' }}
            >
              <option value="ALL">Todas las Facultades</option>
              <option value="FAFI">FAFI (Administración e Informática)</option>
              <option value="FCJSE">FCJSE (Jurídicas y Educación)</option>
              <option value="FACIAG">FACIAG (Agropecuaria)</option>
              <option value="FSC">FSC (Ciencias de la Salud)</option>
            </select>

            {/* Selector Rol */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-bank cursor-pointer"
              style={{ height: '42px', width: 'auto', fontSize: '13px', paddingRight: '28px' }}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="student">Estudiantes</option>
              <option value="admin">Administradores</option>
            </select>

            {/* Exportar */}
            <button
              onClick={handleExportCSV}
              className="btn-ghost flex items-center gap-2 font-semibold"
              style={{ height: '42px', padding: '0 16px', border: '1.5px solid var(--border-strong)', background: 'var(--surface-0)' }}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── DIRECTORIO / TABLA FINTECH ────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-extrabold text-sm tracking-wide uppercase" style={{ color: 'var(--ink-1)' }}>
            Directorio Oficial de Usuarios ({filteredUsers.length})
          </h3>
          <span className="text-xs" style={{ color: 'var(--ink-3)' }}>
            Actualizado en tiempo real por Firebase
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <UserCheck className="w-10 h-10 mx-auto opacity-30" style={{ color: 'var(--ink-3)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>No se encontraron usuarios</p>
            <p className="text-xs" style={{ color: 'var(--ink-3)' }}>Intenta cambiar los términos o filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--ink-3)', background: 'var(--surface-1)' }}>
                  <th className="py-3 px-6">Estudiante / Usuario</th>
                  <th className="py-3 px-6">Cédula (Módulo 10)</th>
                  <th className="py-3 px-6">Afiliación Académica</th>
                  <th className="py-3 px-6">Semestre</th>
                  <th className="py-3 px-6">Actividad Crediticia</th>
                  <th className="py-3 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm font-medium" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredUsers.map((user) => {
                  const initials = (user.fullName || user.email || 'UTB').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                  const userLoans = getUserLoans(user);
                  const activeLoans = userLoans.filter(l => ['active', 'approved', 'overdue'].includes(l.status));

                  return (
                    <tr
                      key={user.uid}
                      className="transition-colors duration-150 group"
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-1)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      {/* Usuario */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-xs"
                            style={{ background: user.role === 'admin' ? '#3B82F6' : 'var(--brand)' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm" style={{ color: 'var(--ink-1)' }}>
                                {user.fullName || 'Estudiante Sin Nombre'}
                              </p>
                              {user.role === 'admin' ? (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                  Admin
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--brand-muted)', color: 'var(--brand)' }}>
                                  Estudiante
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-lg font-mono text-xs font-bold" style={{ background: 'var(--surface-1)', color: 'var(--ink-1)', border: '1px solid var(--border-subtle)' }}>
                          {user.cedula || 'Sin Cédula'}
                        </span>
                      </td>

                      {/* Afiliación */}
                      <td className="py-4 px-6">
                        <p className="text-xs font-bold truncate max-w-[220px]" style={{ color: 'var(--ink-1)' }}>
                          {user.career || 'Carrera General'}
                        </p>
                        <p className="text-[11px] truncate max-w-[220px]" style={{ color: 'var(--ink-3)' }}>
                          {user.faculty || 'Universidad Técnica de Babahoyo'}
                        </p>
                      </td>

                      {/* Semestre */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-xs text-center" style={{ color: 'var(--ink-2)' }}>
                          {user.semester ? `${user.semester}º Semestre` : 'N/A'}
                        </span>
                      </td>

                      {/* Actividad Crediticia */}
                      <td className="py-4 px-6">
                        {userLoans.length === 0 ? (
                          <span className="badge badge-neutral text-[11px]">Sin solicitudes</span>
                        ) : activeLoans.length > 0 ? (
                          <span className="badge badge-success text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {activeLoans.length} crédito activo
                          </span>
                        ) : (
                          <span className="badge badge-info text-[11px]">
                            {userLoans.length} historial liquidado
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="btn-ghost text-xs font-bold py-1.5 px-3 rounded-xl transition-all"
                          style={{ border: '1px solid var(--border-subtle)' }}
                        >
                          Expediente
                          <ExternalLink className="w-3.5 h-3.5 ml-1 inline text-emerald-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL EXPEDIENTE DETALLADO ──────────────────────── */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadein-pure"
          style={{ background: 'rgba(7, 11, 19, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface-0)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md shrink-0"
                  style={{ background: selectedUser.role === 'admin' ? '#3B82F6' : 'var(--brand)' }}
                >
                  {(selectedUser.fullName || selectedUser.email || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold" style={{ color: 'var(--ink-1)' }}>
                    {selectedUser.fullName || 'Estudiante UTB'}
                  </h3>
                  <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--ink-3)' }}>
                    <Mail className="w-3.5 h-3.5" />
                    {selectedUser.email}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-brand text-[10px]">
                      {selectedUser.role === 'admin' ? 'Administrador Oficial' : 'Estudiante UTB'}
                    </span>
                    <span className="badge badge-success text-[10px]">
                      Módulo 10 Verificado
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl transition-colors hover:bg-slate-800/40 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos Académicos y Personales */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>
                Información Institucional
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[11px] uppercase font-semibold" style={{ color: 'var(--ink-3)' }}>Cédula</p>
                  <p className="font-mono font-bold text-sm mt-1" style={{ color: 'var(--ink-1)' }}>{selectedUser.cedula || 'N/A'}</p>
                </div>
                <div className="p-3.5 rounded-2xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[11px] uppercase font-semibold" style={{ color: 'var(--ink-3)' }}>Nivel / Semestre</p>
                  <p className="font-bold text-sm mt-1" style={{ color: 'var(--ink-1)' }}>{selectedUser.semester ? `${selectedUser.semester}º Semestre` : 'N/A'}</p>
                </div>
                <div className="p-3.5 rounded-2xl sm:col-span-1 col-span-2" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[11px] uppercase font-semibold" style={{ color: 'var(--ink-3)' }}>Teléfono</p>
                  <p className="font-mono font-bold text-sm mt-1" style={{ color: 'var(--ink-1)' }}>{selectedUser.phone || 'No registrado'}</p>
                </div>
                <div className="p-3.5 rounded-2xl sm:col-span-3 col-span-2" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[11px] uppercase font-semibold" style={{ color: 'var(--ink-3)' }}>Carrera y Facultad</p>
                  <p className="font-bold text-sm mt-1" style={{ color: 'var(--ink-1)' }}>{selectedUser.career}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>{selectedUser.faculty}</p>
                </div>
              </div>
            </div>

            {/* Historial Crediticio */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>
                  Historial de Créditos y Solicitudes
                </h4>
                <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>
                  {getUserLoans(selectedUser).length} registros
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {getUserLoans(selectedUser).length === 0 ? (
                  <div className="p-8 rounded-2xl text-center border-dashed border-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <CreditCard className="w-8 h-8 mx-auto opacity-30 mb-2" style={{ color: 'var(--ink-3)' }} />
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>
                      Este usuario aún no ha solicitado microcrédito estudiantil.
                    </p>
                  </div>
                ) : (
                  getUserLoans(selectedUser).map((loan) => (
                    <div
                      key={loan.id}
                      className="p-4 rounded-2xl flex items-center justify-between border"
                      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--ink-1)' }}>
                          Microcrédito Solidario — {loan.career || 'Gastos Universiarios'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>
                          Solicitado: {new Date(loan.createdAt || '').toLocaleDateString('es-EC')} · {loan.durationWeeks} cuotas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm" style={{ color: 'var(--ink-1)' }}>
                          ${loan.requestedAmount}.00 USD
                        </p>
                        <span className={`badge ${
                          loan.status === 'active' || loan.status === 'approved' ? 'badge-success' :
                          loan.status === 'pending' ? 'badge-warning' :
                          loan.status === 'rejected' ? 'badge-danger' : 'badge-info'
                        } mt-1 text-[10px]`}>
                          {loan.status === 'active' ? 'En curso' : loan.status === 'pending' ? 'En revisión' : loan.status === 'rejected' ? 'Devuelto' : 'Liquidado'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pie del modal */}
            <div className="pt-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-primary"
                style={{ height: '40px', padding: '0 20px', fontSize: '13px' }}
              >
                Cerrar expediente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
