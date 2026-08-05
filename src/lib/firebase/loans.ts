'use client';

import { collection, doc, addDoc, updateDoc, setDoc, getDoc, deleteDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './client';
import type { LoanApplication, LoanStatus, PaymentReceipt } from '../../types/credit';
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
  const trimmed = guarantorIdentifier.trim();
  if (!trimmed) {
    return { valid: false, error: 'Por favor ingresa la Cédula o el Correo Institucional de tu compañero garante.' };
  }

  try {
    const usersRef = collection(db, 'users');
    let guarantorDocId: string | null = null;
    let docData: UserProfile | null = null;

    // --- Búsqueda por cédula ---
    try {
      const qCedula = query(usersRef, where('cedula', '==', trimmed));
      const snapCedula = await getDocs(qCedula);
      if (!snapCedula.empty) {
        guarantorDocId = snapCedula.docs[0].id; // El docId ES el UID en esta app
        docData = snapCedula.docs[0].data() as UserProfile;
      }
    } catch (innerErr: any) {
      // Si hay error de índice o permisos en la query por cédula, loguear pero continuar con búsqueda por email
      console.warn('[verifyGuarantor] Error en búsqueda por cédula:', innerErr?.code, innerErr?.message);
    }

    // --- Búsqueda por correo (fallback) ---
    if (!docData) {
      try {
        const qEmail = query(usersRef, where('email', '==', trimmed.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          guarantorDocId = snapEmail.docs[0].id;
          docData = snapEmail.docs[0].data() as UserProfile;
        }
      } catch (innerErr: any) {
        console.warn('[verifyGuarantor] Error en búsqueda por correo:', innerErr?.code, innerErr?.message);
        throw innerErr; // Re-lanzar para capturarlo en el catch externo con mensaje específico
      }
    }

    if (!docData || !guarantorDocId) {
      return {
        valid: false,
        error: 'No encontramos ningún estudiante registrado con esa cédula o correo. Pídele a tu compañero que se registre primero en EduCrédito UTB.',
      };
    }

    // Usar el ID del documento como UID canónico (evita inconsistencias si el campo uid está desincronizado)
    const guarantorUid = guarantorDocId;

    if (guarantorUid === applicantUid) {
      return {
        valid: false,
        error: 'Por normas de ética financiera universitaria, no puedes ser tu propio garante solidario.',
      };
    }

    // Validación especial de 1er semestre
    const guarantorSemester = Number(docData.semester || 1);
    const firstName = (docData.fullName || 'tu compañero').split(' ')[0];
    if (Number(applicantSemester) === 1 && guarantorSemester < 2) {
      return {
        valid: false,
        error: `Como estudiante de 1er Semestre, el reglamento exige que tu garante curse el 2do Semestre o superior (${firstName} cursa actualmente el ${guarantorSemester}º Semestre).`,
      };
    }

    const guarantor: VerifiedGuarantor = {
      uid: guarantorUid,
      fullName: docData.fullName || 'Estudiante UTB',
      cedula: docData.cedula || '',
      email: docData.email || '',
      semester: guarantorSemester,
      faculty: docData.faculty || 'UTB',
      career: docData.career || 'Estudiante',
    };

    return { valid: true, guarantor };

  } catch (error: any) {
    console.error('[verifyGuarantor] Error inesperado:', error);

    // Mensajes específicos por código de error de Firestore
    if (error?.code === 'permission-denied') {
      return {
        valid: false,
        error: 'Sin permisos para consultar el registro de estudiantes. Contacta al administrador de la UTB.',
      };
    }
    if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded') {
      return {
        valid: false,
        error: 'No se pudo contactar con el servidor de la UTB. Verifica tu conexión a internet e inténtalo de nuevo.',
      };
    }
    if (error?.code === 'failed-precondition') {
      return {
        valid: false,
        error: 'La base de datos requiere configuración de índices. Contacta al administrador técnico de la plataforma.',
      };
    }

    return {
      valid: false,
      error: 'Ocurrió un error inesperado al consultar el registro de estudiantes. Intenta de nuevo en unos segundos.',
    };
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
 * Almacena archivos grandes en Firestore en bloques de 700 KB (para sortear el límite de 1MB por documento de Firestore)
 * o de forma directa si son livianos.
 */
async function saveDocumentToFirestore(loanId: string, dataUrl: string): Promise<string> {
  const CHUNK_SIZE = 700000; // 700 KB por fragmento
  if (dataUrl.length <= CHUNK_SIZE) {
    return dataUrl;
  }

  try {
    const chunkCount = Math.ceil(dataUrl.length / CHUNK_SIZE);
    for (let i = 0; i < chunkCount; i++) {
      const slice = dataUrl.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await setDoc(doc(db, 'loan_documents', `${loanId}_${i}`), {
        slice,
        chunkIndex: i,
        totalChunks: chunkCount,
        loanId,
        updatedAt: new Date().toISOString(),
      });
    }
    return `firestore_chunked:${loanId}`;
  } catch (err) {
    console.error('Error al fragmentar documento en Firestore:', err);
    return dataUrl.slice(0, 800000); // Fallback parcial en caso de error extremo
  }
}

/**
 * Recupera y reconstruye archivos (sea que estén en Data URL directo o fragmentados en Firestore).
 */
export async function fetchLoanDocument(urlOrRef?: string): Promise<string> {
  if (!urlOrRef) return '';
  if (!urlOrRef.startsWith('firestore_chunked:')) {
    return urlOrRef;
  }

  const loanId = urlOrRef.split(':')[1];
  try {
    let completeDataUrl = '';
    for (let i = 0; i < 15; i++) {
      const docSnap = await getDoc(doc(db, 'loan_documents', `${loanId}_${i}`));
      if (!docSnap.exists()) break;
      const data = docSnap.data();
      completeDataUrl += data.slice || '';
      if (i + 1 >= (data.totalChunks || 1)) break;
    }
    return completeDataUrl;
  } catch (error) {
    console.error('Error reconstruyendo documento desde Firestore:', error);
    return '';
  }
}

/**
 * Crea y envía una nueva solicitud oficial de microcrédito a la nube de Firebase, incorporando al garante verificado y certificado adjunto.
 */
export async function createLoanRequest(
  user: UserProfile,
  amount: number,
  weeks: number,
  grade: number,
  guarantor: VerifiedGuarantor,
  certificateUrl?: string,
  certificateFileName?: string
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
    
    previousSemesterGrade: Number(grade || 0),
    ...(certificateFileName ? { certificateFileName: certificateFileName } : {}),
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

    // Si hay un archivo adjunto (hasta 2.5 MB), lo persistimos y conectamos al expediente
    if (certificateUrl) {
      const finalDocUrl = await saveDocumentToFirestore(docRef.id, certificateUrl);
      await updateDoc(docRef, { certificateDocumentUrl: finalDocUrl });
    }

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
    
    // Filtros de deuda solidaria: mostrar si el crédito está en mora ('overdue') o si acumula cuotas VENCIDAS
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Comparar solo fecha, sin hora
    const debts = allGuaranteed.filter((loan) => {
      if (loan.status === 'overdue') return true;
      // Bug 3 fix: Contar cuotas vencidas (dueDate < hoy Y sin pagar), NO el total de impagas.
      // Un crédito recién activado tiene cuotas futuras sin pagar, no en mora.
      const overdueCount = (loan.installments || []).filter((inst) => {
        if (inst.isPaid) return false;
        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;
      return loan.status === 'active' && overdueCount >= 2;
    });

    callback(debts);
  }, (error) => {
    console.error('Error al escuchar deudas garantizadas:', error);
    callback([]);
  });
}

/**
 * Simula el pago de una cuota semanal y genera el recibo institucional digital de la UTB.
 */
export async function simulateInstallmentPayment(loanId: string, installmentIndex: number): Promise<{ success: boolean; error?: string; receipt?: PaymentReceipt }> {
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

    const refNumber = `UTB-REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    installments[installmentIndex] = {
      ...installments[installmentIndex],
      isPaid: true,
      paidAt: nowIso,
      receiptReference: refNumber,
    };

    // Si con esta cuota se pagaron todas, el estado general cambia de inmediato a 'paid'
    const allPaid = installments.every((inst) => inst.isPaid);
    const newStatus: LoanStatus = allPaid ? 'paid' : 'active';

    await updateDoc(docRef, {
      installments,
      status: newStatus,
      updatedAt: nowIso,
    });

    const receipt: PaymentReceipt = {
      referenceNumber: refNumber,
      loanId: loanId,
      studentName: data.studentName,
      studentCedula: data.studentCedula,
      weekNumber: installments[installmentIndex].weekNumber,
      amount: installments[installmentIndex].amount,
      principal: installments[installmentIndex].principal,
      interest: installments[installmentIndex].interest,
      paidAt: nowIso,
      remainingLoanBalance: allPaid ? 0 : installments[installmentIndex].remainingBalance,
      status: allPaid ? 'CRÉDITO TOTALMENTE LIQUIDADO' : 'CUOTA ABONADA CON ÉXITO',
    };

    return { success: true, receipt };
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

/**
 * ELIMINACIÓN DE EXPEDIENTES (LIMPIEZA DE PRUEBAS / DEMOS):
 * Borra por completo el documento de solicitud en 'loans' y cualquier archivo fragmentado asociado en 'loan_documents'.
 */
export async function deleteLoanApplication(loanId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'loans', loanId);
    await deleteDoc(docRef);
    
    // Limpiar también en segundo plano los posibles bloques del documento PDF o imagen adjunta
    for (let i = 0; i < 15; i++) {
      await deleteDoc(doc(db, 'loan_documents', `${loanId}_${i}`)).catch(() => {});
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error eliminando expediente en Firebase:', error);
    return { success: false, error: error?.message || 'No se pudo eliminar de la base de datos. Verifica las reglas de Firebase.' };
  }
}

