'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { validateEcuadorianCedula } from '../../../lib/validations/ecuador';
import {
  GraduationCap, ArrowRight, Loader2, Eye, EyeOff,
  Shield, CheckCircle2, Lock, Sparkles
} from 'lucide-react';

const FACULTADES_UTB: { [key: string]: string[] } = {
  'FAFI (Administración e Informática)': [
    'Ingeniería en Sistemas / Software',
    'Licenciatura en Contabilidad y Auditoría',
    'Licenciatura en Administración de Empresas',
    'Licenciatura en Gestión de la Información'
  ],
  'FCJSE (Jurídica, Sociales y Educación)': [
    'Derecho y Jurisprudencia',
    'Psicología Clínica y Educativa',
    'Pedagogía de los Idiomas y Extranjeros',
    'Educación Inicial y Básica'
  ],
  'FACIAG (Agropecuaria y Recursos Naturales)': [
    'Ingeniería Agronómica',
    'Medicina Veterinaria y Zootecnia',
    'Ingeniería Ambiental y Agropecuarios'
  ],
  'FSC (Ciencias de la Salud)': [
    'Licenciatura en Enfermería',
    'Licenciatura en Terapia Física',
    'Licenciatura en Nutrición y Dietética',
    'Optometría y Ciencias Visuales'
  ]
};

const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const STEPS_INFO = [
  {
    title: 'Registro Institucional',
    desc: 'Verificamos tu identidad con algoritmo Módulo 10 de Registro Civil y tu matrícula vigente UTB.'
  },
  {
    title: 'Cupo Revolvente Exclusivo',
    desc: 'Accede de forma inmediata a tu línea de microcrédito solidario de hasta $30 USD.'
  },
  {
    title: 'Desembolso Inteligente',
    desc: 'Usa tus recursos para libros, materiales, licencias o viáticos con amortización flexible.'
  }
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<string>('FAFI (Administración e Informática)');
  const [selectedCareer, setSelectedCareer] = useState<string>('Ingeniería en Sistemas / Software');
  const [semester, setSemester] = useState<number>(1);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleFacultyChange = (newFaculty: string) => {
    setSelectedFaculty(newFaculty);
    const availableCareers = FACULTADES_UTB[newFaculty];
    if (availableCareers && availableCareers.length > 0) {
      setSelectedCareer(availableCareers[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEcuadorianCedula(cedula)) {
      setError('La cédula ingresada no supera la verificación del dígito verificador (Módulo 10).');
      return;
    }

    if (!email.toLowerCase().endsWith('.utb.edu.ec') && !email.toLowerCase().includes('utb')) {
      setError('Debes utilizar tu correo institucional de la UTB (ej. estudiante@utb.edu.ec).');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      email,
      password,
      fullName,
      cedula,
      faculty: selectedFaculty,
      career: selectedCareer,
      semester: Number(semester),
      role: 'student'
    });
    setIsSubmitting(false);

    if (result.success) {
      alert(`¡Cuenta creada! Bienvenido al Fondo Cooperativo, ${fullName}.`);
      router.push('/dashboard');
    } else {
      setError(result.error || 'No se pudo completar el registro.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-page)' }}>

      {/* ── PANEL IZQUIERDO — Branding & Trust ───────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: '#090E17', color: '#FFFFFF' }}
      >
        {/* Resplandor radial ambiental */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0, 196, 140, 0.18) 0%, transparent 70%),
              radial-gradient(ellipse 50% 60% at 10% 90%, rgba(37, 99, 235, 0.14) 0%, transparent 70%)
            `,
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'var(--brand)' }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-none text-white">EduCrédito UTB</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Universidad Técnica de Babahoyo
            </p>
          </div>
        </div>

        {/* Contenido Central — Cómo Funciona */}
        <div className="relative my-auto py-8 space-y-8">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0, 196, 140, 0.15)', color: '#00C48C', border: '1px solid rgba(0, 196, 140, 0.25)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Alta Institucional 100% Digital
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mt-4 tracking-tight">
              Únete al ecosistema de <br />
              <span style={{ color: '#00C48C' }}>inclusión financiera</span> <br />
              estudiantil.
            </h1>
          </div>

          {/* Pasos explicativos */}
          <div className="space-y-6 pt-2">
            {STEPS_INFO.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div
                  className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm"
                  style={{
                    background: idx === 0 ? 'var(--brand)' : 'rgba(255,255,255,0.08)',
                    color: idx === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    border: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del panel izquierdo */}
        <div className="relative pt-6 border-t flex items-center justify-between text-xs" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }}>
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" /> Verificación Módulo 10 D.V.
          </span>
          <span>© 2026 UTB Babahoyo</span>
        </div>
      </div>

      {/* ── PANEL DERECHO — Formulario ────────────────── */}
      <div className="flex-1 px-6 sm:px-12 py-10 relative overflow-y-auto">

        {/* Gradiente sutil de fondo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          aria-hidden
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--brand) 6%, transparent) 0%, transparent 70%)',
          }}
        />

        {/* Contenedor con min-h-full y justify-center para evitar recorte arriba en overflow */}
        <div className="w-full max-w-[520px] mx-auto min-h-full flex flex-col justify-center relative animate-fadein py-4">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--ink-1)' }}>EduCrédito UTB</p>
              <p className="text-xs" style={{ color: 'var(--ink-3)' }}>Alta Institucional</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink-1)' }}>
              Crear tu cuenta
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-3)' }}>
              Ingresa tus datos personales y académicos para habilitar tu perfil.
            </p>
          </div>

          {error && (
            <div
              className="p-3.5 rounded-xl text-sm font-medium mb-6 animate-fadein"
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
              }}
            >
              {error}
            </div>
          )}

          {/* Formulario 2 columnas */}
          <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Nombres */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Apellidos y Nombres Completos
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrade Zambrano María José"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-bank"
                />
              </div>

              {/* Cédula */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="1204567890"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                  className="input-bank font-mono"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Correo Institucional (@utb.edu.ec)
                </label>
                <input
                  type="email"
                  required
                  placeholder="estudiante@utb.edu.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-bank"
                />
              </div>

              {/* Facultad */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Facultad
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="input-bank cursor-pointer"
                >
                  {Object.keys(FACULTADES_UTB).map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>

              {/* Carrera */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Carrera
                </label>
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="input-bank cursor-pointer"
                >
                  {FACULTADES_UTB[selectedFaculty]?.map((carr) => (
                    <option key={carr} value={carr}>{carr}</option>
                  ))}
                </select>
              </div>

              {/* Semestre */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Semestre Actual
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="input-bank cursor-pointer font-semibold"
                >
                  {SEMESTRES.map((sem) => (
                    <option key={sem} value={sem}>{sem}º Semestre</option>
                  ))}
                </select>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-2)' }}>
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 8 caracteres con números y símbolos"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-bank pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--ink-3)' }}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !fullName || !cedula || !email || !password}
              className="btn-primary w-full shadow-lg transition-transform active:scale-[0.99]"
              style={{ height: '48px', fontSize: '15px', marginTop: '20px' }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verificar y crear cuenta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link a login */}
          <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              ¿Ya cuentas con tu usuario y contraseña?{' '}
              <Link
                href="/login"
                className="font-bold transition-opacity hover:opacity-75"
                style={{ color: 'var(--brand)' }}
              >
                Iniciar sesión →
              </Link>
            </p>
          </div>

          {/* Sello de seguridad */}
          <div
            className="flex items-center justify-center gap-2 mt-6 text-xs font-medium"
            style={{ color: 'var(--ink-3)' }}
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            Datos protegidos bajo normativa de privacidad estudiantil UTB
          </div>
        </div>
      </div>
    </div>
  );
}
