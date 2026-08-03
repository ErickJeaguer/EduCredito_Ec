/**
 * Motor de Scoring Crediticio Académico-Financiero (EduCréditoEC v1.1.0).
 * Calcula un puntaje de 0 a 100 evaluando rendimiento académico en la UTB y comportamiento financiero.
 */

export type PaymentHistoryStatus = 'new' | 'excellent' | 'minor_delay' | 'default';

export interface StudentProfileForScoring {
  gpa: number;              // Promedio sobre 10 (ej: 8.50)
  semester: number;         // Semestre actual en la UTB (1 a 10)
  paymentHistory: PaymentHistoryStatus; // Estado en créditos pasados
  completedLoansCount: number; // Número de préstamos cancelados exitosamente
  hasActiveDefault?: boolean;  // Si actualmente tiene mora no justificada
}

export interface CreditScoreResult {
  totalScore: number;          // 0 a 100 puntos
  academicScore: number;       // Máximo 50 puntos
  financialScore: number;      // Máximo 50 puntos
  breakdown: {
    gpaPoints: number;         // Máx 30 pts
    semesterPoints: number;    // Máx 20 pts
    historyPoints: number;     // Máx 30 pts
    progressionPoints: number; // Máx 20 pts
  };
  maxAllowedAmount: number;    // Cupo máximo otorgado en USD ($30, $60, o $90)
  unlockedTermsWeeks: number[];// Plazos en semanas habilitados (ej: [1, 2, 4] u [1, 2, 4, 8])
  isEligible: boolean;         // Elegibilidad general
  ineligibilityReason?: string;// Razón si no es elegible
}

export function calculateCreditScore(profile: StudentProfileForScoring): CreditScoreResult {
  // Verificación estricta de mora / default (Sección 3.1.3 y 5.1)
  if (profile.hasActiveDefault || profile.paymentHistory === 'default') {
    return {
      totalScore: 0,
      academicScore: 0,
      financialScore: 0,
      breakdown: { gpaPoints: 0, semesterPoints: 0, historyPoints: 0, progressionPoints: 0 },
      maxAllowedAmount: 0,
      unlockedTermsWeeks: [],
      isEligible: false,
      ineligibilityReason: 'Estudiante inhabilitado: Registra créditos o cuotas semanales en estado de mora no justificada.',
    };
  }

  // 1. Rendimiento Académico - Promedio / GPA (Máximo 30 pts)
  let gpaPoints = 0;
  if (profile.gpa >= 9.00) gpaPoints = 30;
  else if (profile.gpa >= 8.00) gpaPoints = 20;
  else if (profile.gpa >= 7.00) gpaPoints = 10;
  else gpaPoints = 0; // Promedio < 7.00

  // 2. Avance en la Carrera - Semestre (Máximo 20 pts)
  let semesterPoints = 0;
  if (profile.semester >= 6) semesterPoints = 20;
  else if (profile.semester >= 3) semesterPoints = 10;
  else if (profile.semester >= 1) semesterPoints = 5;

  const academicScore = gpaPoints + semesterPoints;

  // 3. Historial de Pago Semanal Interno (Máximo 30 pts)
  let historyPoints = 0;
  if (profile.paymentHistory === 'new' || profile.paymentHistory === 'excellent') {
    historyPoints = 30;
  } else if (profile.paymentHistory === 'minor_delay') {
    historyPoints = 15;
  }

  // 4. Progresión de Cupo Desbloqueado según historial de créditos completados (Máximo 20 pts)
  let progressionPoints = 5; // Puntuación inicial al nuevo solicitante
  if (profile.completedLoansCount === 1) progressionPoints = 10;
  else if (profile.completedLoansCount === 2) progressionPoints = 15;
  else if (profile.completedLoansCount >= 3) progressionPoints = 20;

  const financialScore = historyPoints + progressionPoints;
  const totalScore = Math.min(100, academicScore + financialScore);

  // Determinar cupo crediticio desbloqueado según Score y Regla de Progresión (Sección 3.2 y 5.1)
  let maxAllowedAmount = 30;
  let unlockedTermsWeeks = [1, 2, 4]; // 1 sem, 15 días (2 sem), 30 días (4 sem)

  if (profile.completedLoansCount === 0) {
    // Regla de Sección 3.2: Estudiantes nuevos / Nivel Inicial tope máximo hasta $30 USD
    maxAllowedAmount = 30;
  } else if (totalScore >= 75 && profile.completedLoansCount >= 2) {
    // Score >= 75 pts con historial de progresión: Cupo máximo de $90 USD y desbloqueo del plazo 60 días
    maxAllowedAmount = 90;
    unlockedTermsWeeks = [1, 2, 4, 8]; // 8 semanas = 60 días
  } else if (totalScore >= 50 || profile.completedLoansCount === 1) {
    maxAllowedAmount = 60;
  }

  return {
    totalScore,
    academicScore,
    financialScore,
    breakdown: { gpaPoints, semesterPoints, historyPoints, progressionPoints },
    maxAllowedAmount,
    unlockedTermsWeeks,
    isEligible: true,
  };
}

/**
 * Valida si los parámetros solicitados por el estudiante cumplen las restricciones de monto y plazo (Sección 8.2 y 8.3)
 */
export function validateLoanRequestParams(amount: number, termWeeks: number, score: CreditScoreResult): { valid: boolean; error?: string } {
  if (!score.isEligible) {
    return { valid: false, error: score.ineligibilityReason || 'No elegible para créditos.' };
  }

  if (amount < 10) {
    return { valid: false, error: 'El monto mínimo permitido es de $10.00 USD.' };
  }

  if (amount > score.maxAllowedAmount) {
    return { valid: false, error: `Tu cupo crediticio actual (${score.totalScore} pts) te permite solicitar hasta $${score.maxAllowedAmount}.00 USD.` };
  }

  if (!score.unlockedTermsWeeks.includes(termWeeks)) {
    return { valid: false, error: `El plazo de ${termWeeks} semanas no está habilitado para tu nivel de score crediticio actual.` };
  }

  // Regla Sección 8.3: La opción de 60 días (8 semanas) solo se habilita si el monto es EXACTAMENTE $90.00 USD
  if (termWeeks === 8 && amount !== 90) {
    return { valid: false, error: 'El plazo especial de 60 días solo es utilizable para créditos por el monto tope de $90.00 USD.' };
  }

  return { valid: true };
}
