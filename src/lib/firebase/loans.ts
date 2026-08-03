'use client';

import { collection, doc, addDoc, updateDoc, getDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './client';
import type { LoanApplication, LoanStatus } from '../../types/credit';
import { generateAmortizationSchedule } from '../financial/amortization';
import type { UserProfile } from '../../types/user';

export interface VerifiedGuarantor {
  uid: string;
  fullName: string;
  cedula: string;
  email: string;
  semester: number;
  faculty: string;
  career: string;
}

/**
 * Verifica en Google Firestore si el garante propuesto existe y cumple las normas solidarias de la UTB.
 * REGLA 1ER SEMESTRE: Si el solicitante cursa 1er semestre, el garante debe cursar 2do semestre o superior.
 */
export async function verifyGuarantorEligibility(
  applicantUid: string,
  applicantSemester: number,
  guarantorIdentifier: string
): Promise<{ valid: boolean; error?: string; guarantor?: VerifiedGuarantor }> {
  try {
    const trimmed = guarantorIdentifier.trim();
    if (!trimmed) {
      return { valid: false, error: 'Por favor ingresa la Cédula o el Correo Institucional de tu compañero garante.' };
    }

    const usersRef = collection(db, 'users');
    // Consultamos si coincide con cédula o correo
    const qCedula = query(usersRef, where('cedula', '==', trimmed));
    const snapCedula = await getDocs(qCedula);

    let docData: UserProfile | null = null;

    if (!snapCedula.empty) {
      docData = snapCedula.docs[0].data() as UserProfile;
    } else {
      // Intentar por correo institucional
      const qEmail = query(usersRef, where('email', '==', trimmed.toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        docData = snapEmail.docs[0].data() as UserProfile;
      }
    }

    if (!docData) {
      return { 
        valid: false, 
        error: 'No encontramos a ningún estudiante universitario registrado con esa cédula o correo. Pídele a tu compañero que se registre primero en EduCrédito UTB.' 
      };
    }

    if (docData.uid === applicantUid) {
      return { 
        valid: false, 
        error: 'Por normas de ética financiera universitaria, no puedes ser tu propio garante solidario.' 
      };
    }

    // Validación especial de 1er semestre
    const guarantorSemester = Number(docData.semester || 1);
    if (Number(applicantSemester) === 1 && guarantorSemester < 2) {
      return { 
        valid: false, 
        error: `Como estudiante de 1er Semestre, el reglamento exige que tu garante curse el 2do Semestre o superior (tu compañero ${docData.fullName.split(' ')[0]} cursa actualmente el ${guarantorSemester}º Semestre).` 
      };
    }

    const guarantor: VerifiedGuarantor = {
      uid: docData.uid,
      fullName: docData.fullName,
      cedula: docData.cedula,
      email: docData.email,
      semester: guarantorSemester,
      faculty: docData.faculty || 'UTB',
      career: docData.career || 'Estudiante',
    };

    return { valid: true, guarantor };
  } catch (error) {
    console.error('Error al verificar garante en Nube:', error);
    return { valid: false, error: 'Error al consultar la base de datos de estudiantes UTB. Revisa tu conexión.' };
  }
}

/**
 * Verifica si el alumno tiene un microcrédito activo, en mora o pendiente de revisión.
 * Actúa como candado anti-sobreendeudamiento protegiendo la salud financiera estudiantil.
 */
export async function checkActiveLoanRestriction(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const loansRef = collection(db, 'loans');
    // Consultamos por userId sin ordenar para evitar requerir índices compuestos externos
    const q = query(loansRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      for (const docSnap of snap.docs) {
        const existing = docSnap.data() as LoanApplication;
        if (existing.status === 'pending') {
          return { allowed: false, reason: 'Ya posees una solicitud en proceso de revisión por parte de la secretaría de la UTB.' };
        }
        if (existing.status === 'approved' || existing.status === 'active' || existing.status === 'overdue') {
          return { allowed: false, reason: 'Tienes un microcrédito actualmente en curso. Para mantener una conducta financiera saludable, debes cancelar tus cuotas antes de solicitar uno nuevo.' };
        }
      }
    }
    return { allowed: true };
  } catch (error) {
    console.error('Error consultando restricciones crediticias:', error);
    return { allowed: true };
  }
}

/**
 * Crea y envía una nueva solicitud oficial de microcrédito a la nube de Firebase, incorporando al garante verificado y promedio académico.
 */
export async function createLoanRequest(
  user: UserProfile,
  amount: number,
  weeks: number,
  grade: number,
  guarantor: VerifiedGuarantor
): Promise<{ success: boolean; error?: string; loanId?: string }> {
  // 1. Verificación en tiempo real de reglas anti-sobreendeudamiento
  const restriction = await checkActiveLoanRestriction(user.uid);
  if (!restriction.allowed) {
    return { success: false, error: restriction.reason };
  }

  // 2. Ejecutar motor financiero y de fechas para cuotas semanales los lunes
  const schedule = generateAmortizationSchedule(amount, weeks, new Date());

  const newLoan: Omit<LoanApplication, 'id'> = {
    userId: user.uid,
    studentName: user.fullName,
    studentCedula: user.cedula,
    faculty: user.faculty || 'Universidad Técnica de Babahoyo',
    career: user.career || 'Estudiante',
    semester: user.semester || 1,
    
    previousSemesterGrade: Number(grade),
    guarantorUid: guarantor.uid,
    guarantorName: guarantor.fullName,
    guarantorCedula: guarantor.cedula || guarantor.email,
    guarantorSemester: guarantor.semester,

    requestedAmount: amount,
    durationWeeks: weeks,
    annualInterestRate: 8.5,
    weeklyPaymentAmount: schedule.weeklyPaymentAmount,
    totalRepaymentAmount: schedule.totalRepayment,
    totalInterest: schedule.totalInterest,
    status: 'pending',
    installments: schedule.schedule.map((item) => ({
      weekNumber: item.installmentNumber,
      dueDate: item.dueDate.toISOString().split('T')[0],
      principal: item.principal,
      interest: item.interest,
      amount: item.amount,
      remainingBalance: item.remainingBalance,
      isPaid: false,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const loansRef = collection(db, 'loans');
    const docRef = await addDoc(loansRef, newLoan);
    return { success: true, loanId: docRef.id };
  } catch (error) {
    console.error('Error persistiendo solicitud en Firestore:', error);
    return { success: false, error: 'Ocurrió un problema al enviar los datos al servidor. Intenta de nuevo.' };
  }
}

/**
 * Escucha en tiempo real (Live Snapshot) el historial y evolución de los préstamos propios del alumno.
 */
export function subscribeToStudentLoans(userId: string, callback: (loans: LoanApplication[]) => void): () => void {
  const loansRef = collection(db, 'loans');
  const q = query(loansRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snap) => {
    const loans: LoanApplication[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LoanApplication, 'id'>),
    }));
    // Ordenar en cliente descendentemente
    loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(loans);
  }, (error) => {
    console.error('Error al escuchar actualización de préstamos:', error);
    callback([]);
  });
}

/**
 * Escucha en tiempo real los préstamos donde EL USUARIO ES GARANTE y se encuentran en estado de MORA (overdue).
 * Si un compañero no paga sus cuotas, la deuda repercute e informa en el panel de su garante.
 */
export function subscribeToGuaranteedDebts(userId: string, callback: (debts: LoanApplication[]) => void): () => void {
  const loansRef = collection(db, 'loans');
  // Consultamos créditos en los que este alumno fue registrado como garante solidario
  const q = query(loansRef, where('guarantorUid', '==', userId));
  
  return onSnapshot(q, (snap) => {
    const allGuaranteed: LoanApplication[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LoanApplication, 'id'>),
    }));
    
    // Filtros de deuda solidaria: mostrar si el crédito está en mora ('overdue') o si acumula cuotas impagadas
    const debts = allGuaranteed.filter((loan) => {
      if (loan.status === 'overdue') return true;
      // Verificar si hay 2 o más cuotas pendientes vencidas para activar alerta en el garante
      const unpaidCount = loan.installments.filter((inst) => !inst.isPaid).length;
      return loan.status === 'active' && unpaidCount >= 2;
    });

    callback(debts);
  }, (error) => {
    console.error('Error al escuchar deudas garantizadas:', error);
    callback([]);
  });
}

/**
 * Simula el pago de una cuota semanal o permite activar un préstamo para pruebas en el prototipo de la UTB.
 */
export async function simulateInstallmentPayment(loanId: string, installmentIndex: number): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'loans', loanId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'El registro crediticio no fue localizado.' };
    }

    const data = docSnap.data() as LoanApplication;
    const installments = [...data.installments];
    
    if (!installments[installmentIndex]) {
      return { success: false, error: 'Número de cuota inválido.' };
    }

    installments[installmentIndex] = {
      ...installments[installmentIndex],
      isPaid: true,
      paidAt: new Date().toISOString(),
    };

    // Si con esta cuota se pagaron todas, el estado general cambia de inmediato a 'paid'
    const allPaid = installments.every((inst) => inst.isPaid);
    const newStatus: LoanStatus = allPaid ? 'paid' : 'active';

    await updateDoc(docRef, {
      installments,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error al procesar pago simulado:', error);
    return { success: false, error: 'Fallo al registrar el abono en la base de datos.' };
  }
}

/**
 * Helper especial para demostraciones en vivo: Permite al estudiante o evaluador aprobar un préstamo pendiente o simular mora.
 */
export async function demoApproveLoan(loanId: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, 'loans', loanId);
    await updateDoc(docRef, {
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error aprobando crédito en modo demo:', error);
    return { success: false };
  }
}

/**
 * Helper de demostración para probar cómo una deuda cae en mora y se le reporta al garante solidario.
 */
export async function demoSimulateOverdue(loanId: string): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, 'loans', loanId);
    await updateDoc(docRef, {
      status: 'overdue',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error simulando mora demo:', error);
    return { success: false };
  }
}

/**
 * ADMINISTRADOR: Escucha en tiempo real (Live Snapshot) TODOS los préstamos del fondo universitario.
 */
export function subscribeToAllLoans(callback: (loans: LoanApplication[]) => void): () => void {
  const loansRef = collection(db, 'loans');
  
  return onSnapshot(loansRef, (snap) => {
    const loans: LoanApplication[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LoanApplication, 'id'>),
    }));
    // Ordenar por fecha decreciente en el cliente
    loans.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(loans);
  }, (error) => {
    console.error('Error al escuchar todas las solicitudes en portal Admin:', error);
    callback([]);
  });
}

/**
 * ADMINISTRADOR: Aprueba una solicitud de microcrédito y la pasa a estado activo.
 */
export async function adminApproveLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'loans', loanId);
    await updateDoc(docRef, {
      status: 'active',
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error administrativo al aprobar crédito:', error);
    return { success: false, error: 'No se pudo actualizar el estado de aprobación en el servidor.' };
  }
}

/**
 * ADMINISTRADOR: Rechaza una solicitud de microcrédito especificando un mensaje con el motivo.
 */
export async function adminRejectLoan(loanId: string, rejectionReason: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, error: 'Es obligatorio especificar un motivo de rechazo para notificar al estudiante.' };
    }
    const docRef = doc(db, 'loans', loanId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error administrativo al rechazar crédito:', error);
    return { success: false, error: 'No se pudo registrar el rechazo en el servidor.' };
  }
}

