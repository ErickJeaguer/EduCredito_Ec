/**
 * Tipos y esquemas de datos oficiales para la gestión de Microcréditos, Cuotas y Garantes (Fondo UTB).
 */

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'paid' | 'overdue';

export interface InstallmentItem {
  weekNumber: number;
  dueDate: string;          // Fecha en formato ISO (YYYY-MM-DD) para cada lunes hábil de cobro
  principal: number;        // Abono al capital en USD
  interest: number;         // Abono al interés solidario en USD
  amount: number;           // Cuota semanal fija (Cw)
  remainingBalance: number; // Saldo residual luego del pago
  isPaid: boolean;          // Estado de liquidación de la cuota
  paidAt?: string;          // Timestamp ISO del momento del pago
  receiptReference?: string; // Número de referencia del comprobante digital bancario
}

export interface LoanApplication {
  id?: string;              // ID único del documento en Firestore (/loans/{id})
  userId: string;           // UID del estudiante titular en Firebase Auth
  studentName: string;
  studentCedula: string;
  faculty: string;
  career: string;
  semester: number;
  
  // Requisitos Académicos y Garante Solidario UTB
  previousSemesterGrade: number; // Promedio de notas del semestre anterior
  certificateDocumentUrl?: string; // Documento o certificado de promoción de notas (Base64 / URL)
  certificateFileName?: string;    // Nombre del archivo subido (Ej. certificado_notas.pdf)
  guarantorUid: string;          // UID del compañero garante verificado en Nube
  guarantorName: string;         // Nombre y apellido oficial del garante
  guarantorCedula: string;       // Cédula o correo del garante
  guarantorSemester: number;     // Semestre que cursa el garante (>= 2do para postulantes de 1er sem)

  requestedAmount: number;  // Cupo solicitado ($30, $60 o $90 USD)
  durationWeeks: number;    // Plazo pactado en semanas (2 a 12)
  annualInterestRate: number; // Tasa solidaria fijada (8.50%)
  weeklyPaymentAmount: number;// Cuota Cw calculada
  totalRepaymentAmount: number;// Capital + Interés Total
  totalInterest: number;    // Interés neto en USD
  status: LoanStatus;       // Estado del trámite
  installments: InstallmentItem[]; // Cronograma detallado lunes a lunes
  createdAt: string;        // Timestamp ISO de solicitud
  updatedAt: string;        // Último cambio de estado o pago
  rejectionReason?: string; // Motivo en caso de rechazo administrativo
}

export interface PaymentReceipt {
  referenceNumber: string;    // Código de auditoría (Ej: UTB-REC-2026-89421)
  loanId: string;
  studentName: string;
  studentCedula: string;
  weekNumber: number;
  amount: number;
  principal: number;
  interest: number;
  paidAt: string;
  remainingLoanBalance: number;
  status: 'CUOTA ABONADA CON ÉXITO' | 'CRÉDITO TOTALMENTE LIQUIDADO';
}

