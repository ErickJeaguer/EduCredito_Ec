/**
 * Tipos e interfaces centrales para Identidad, Seguridad y Perfil Académico en EduCréditoEC (UTB).
 */

export type UserRole = 'student' | 'admin' | 'docente';

export type UTBFaculty =
  | 'FAFI (Facultad de Administración, Finanzas e Informática)'
  | 'FCJSE (Facultad de Ciencias Jurídicas, Sociales y Educación)'
  | 'FACIAG (Facultad de Ciencias Agropecuarias)'
  | 'FSC (Facultad de Ciencias de la Salud)';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  cedula: string;       // Cédula ecuatoriana validada con Módulo 10
  faculty: string;      // Facultad universitaria en la UTB
  career: string;       // Carrera estudiantil
  semester: number;     // Semestre actual en curso (1 a 10)
  phone?: string;
  role: UserRole;       // Privilegios (student o admin)
  createdAt?: string | number;
  updatedAt?: string | number;
}
