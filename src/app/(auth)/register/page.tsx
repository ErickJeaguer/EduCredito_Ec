'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { validateEcuadorianCedula } from '../../../lib/validations/ecuador';
import { GraduationCap, ArrowRight, Loader2, LockKeyhole } from 'lucide-react';
import { ThemeToggleButton } from '../../../components/theme/ThemeProvider';

const FACULTADES_UTB: { [key: string]: string[] } = {
  'FAFI (Administración e Informática)': [
    'Ingeniería en Sistemas / Software',
    'Licenciatura en Contabilidad y Auditoría',
    'Licenciatura en Administración de Empresas',
    'Licenciatura en Gestión de la Información',
  ],
  'FCJSE (Jurídica, Sociales y Educación)': [
    'Derecho y Jurisprudencia',
    'Psicología Clínica y Educativa',
    'Pedagogía de los Idiomas y Extranjeros',
    'Educación Inicial y Básica',
  ],
  'FACIAG (Agropecuaria y Recursos Naturales)': [
    'Ingeniería Agronómica',
    'Medicina Veterinaria y Zootecnia',
    'Ingeniería Ambiental y Agropecuarios',
  ],
  'FSC (Ciencias de la Salud)': [
    'Licenciatura en Enfermería',
    'Licenciatura en Terapia Física',
    'Licenciatura en Nutrición y Dietética',
    'Optometría y Ciencias Visuales',
  ],
};

const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      setError('La cédula ecuatoriana ingresada no supera la verificación oficial del Módulo 10.');
      return;
    }

    if (!email.toLowerCase().endsWith('.utb.edu.ec') && !email.toLowerCase().includes('utb')) {
      setError('Debes utilizar un correo universitario oficial de la UTB (ej. usuario@utb.edu.ec).');
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
      role: 'student',
    });
    setIsSubmitting(false);

    if (result.success) {
      alert(`¡Cuenta creada con éxito! Bienvenido al Fondo Cooperativo, ${fullName}.`);
      router.push('/dashboard');
    } else {
      setError(result.error || 'No se pudo completar el registro.');
    }
  };

  const inputCls =
    'w-full h-11 px-3.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition';
  const selectCls =
    'w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-ring focus:border-ring outline-none transition cursor-pointer';
  const labelCls = 'block text-sm font-medium text-foreground mb-1.5';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background">

      {/* PANEL IZQUIERDO */}
      <aside className="hidden lg:flex lg:col-span-4 flex-col justify-between p-10 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="z-10 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-serif font-bold text-lg hover:opacity-90 transition">
            <div className="p-1.5 bg-primary-foreground/15 rounded-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>EduCrédito UTB</span>
          </Link>

          <div className="space-y-3 pt-6">
            <h1 className="font-serif text-2xl font-semibold tracking-tight leading-snug text-balance">
              Registro al fondo cooperativo estudiantil
            </h1>
            <p className="text-sm leading-relaxed opacity-80">
              Completa tu ficha para acceder a microcréditos con cuotas semanales flexibles. Tu cédula será validada automáticamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 space-y-2.5 text-sm opacity-90">
            <p className="font-semibold text-accent">Requisitos para tu primer crédito:</p>
            <ul className="space-y-2 list-disc pl-4">
              <li>Cédula ecuatoriana válida con dígito verificador.</li>
              <li>Correo institucional perteneciente a la UTB.</li>
              <li>Si cursas el <b>1er semestre</b>, necesitarás un compañero garante de 2do semestre o superior.</li>
            </ul>
          </div>
        </div>

        <div className="z-10 pt-8 border-t border-primary-foreground/15 text-[11px] opacity-80 flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <LockKeyhole className="w-3.5 h-3.5" /> Módulo 10 verificado
          </span>
          <span>© 2026 UTB</span>
        </div>
      </aside>

      {/* PANEL DERECHO FORMULARIO */}
      <main className="lg:col-span-8 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-card text-card-foreground">
        <div className="flex items-center justify-between lg:justify-end mb-6">
          <Link href="/" className="inline-flex lg:hidden items-center gap-2 font-serif font-bold text-foreground">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span>EduCrédito UTB</span>
          </Link>
          <ThemeToggleButton />
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-card-foreground">
              Crear cuenta de estudiante
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa tus datos oficiales tal como constan en tu matrícula académica.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-lg bg-danger-soft border border-danger/20 text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Nombres completos</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ana Lucía Pérez"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Cédula ecuatoriana (10 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                  placeholder="1204567890"
                  className={`${inputCls} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Facultad o unidad académica</label>
              <select value={selectedFaculty} onChange={(e) => handleFacultyChange(e.target.value)} className={selectCls}>
                {Object.keys(FACULTADES_UTB).map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className={labelCls}>Carrera o especialidad</label>
                <select value={selectedCareer} onChange={(e) => setSelectedCareer(e.target.value)} className={selectCls}>
                  {FACULTADES_UTB[selectedFaculty]?.map((car) => (
                    <option key={car} value={car}>{car}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Semestre actual</label>
                <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className={selectCls}>
                  {SEMESTRES.map((sem) => (
                    <option key={sem} value={sem}>{sem}º Semestre</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Correo institucional UTB</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estudiante@utb.edu.ec"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Contraseña de acceso</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 px-6 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta y verificando cédula...</>
                ) : (
                  <>Completar registro e iniciar sesión <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>¿Ya te habías registrado antes?</span>
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>

        <div className="mt-8 w-full max-w-2xl mx-auto text-left">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition font-medium">
            ← Volver a la página principal
          </Link>
        </div>
      </main>
    </div>
  );
}
