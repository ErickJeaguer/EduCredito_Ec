import { describe, it, expect } from 'vitest';
import { calculateCreditScore, validateLoanRequestParams, type StudentProfileForScoring } from './scoring';

describe('Motor de Scoring Crediticio Académico-Financiero (EduCréditoEC)', () => {
  it('debe asignar tope de $30 USD a un estudiante nuevo (sin historial previo), sin importar su promedio alto', () => {
    const newStudent: StudentProfileForScoring = {
      gpa: 9.50, // 30 pts
      semester: 6, // 20 pts
      paymentHistory: 'new', // 30 pts
      completedLoansCount: 0, // 5 pts => Total 85 pts
    };

    const result = calculateCreditScore(newStudent);
    expect(result.totalScore).toBe(85);
    expect(result.isEligible).toBe(true);
    expect(result.maxAllowedAmount).toBe(30); // Límite de nuevo ingreso
    expect(result.unlockedTermsWeeks).toEqual([1, 2, 4]); // Sin plazo de 60 días aún
  });

  it('debe otorgar cupo máximo de $90 USD y desbloquear el plazo especial de 60 días (8 semanas) a estudiantes sobresalientes y progresados', () => {
    const advancedStudent: StudentProfileForScoring = {
      gpa: 8.50, // 20 pts
      semester: 7, // 20 pts
      paymentHistory: 'excellent', // 30 pts
      completedLoansCount: 2, // 15 pts => Total 85 pts
    };

    const result = calculateCreditScore(advancedStudent);
    expect(result.totalScore).toBe(85);
    expect(result.maxAllowedAmount).toBe(90);
    expect(result.unlockedTermsWeeks).toContain(8); // Plazo 60 días desbloqueado
  });

  it('debe inhabilitar completamente a un estudiante con mora actual o historial de default', () => {
    const defaultedStudent: StudentProfileForScoring = {
      gpa: 9.20,
      semester: 5,
      paymentHistory: 'default',
      completedLoansCount: 1,
      hasActiveDefault: true,
    };

    const result = calculateCreditScore(defaultedStudent);
    expect(result.isEligible).toBe(false);
    expect(result.totalScore).toBe(0);
    expect(result.maxAllowedAmount).toBe(0);
    expect(result.ineligibilityReason).toContain('inhabilitado');
  });

  it('debe castigar retrasos menores en pagos pasados (15 pts en vez de 30) reduciendo su puntaje y cupo posible', () => {
    const studentWithDelay: StudentProfileForScoring = {
      gpa: 7.20, // 10 pts
      semester: 3, // 10 pts
      paymentHistory: 'minor_delay', // 15 pts
      completedLoansCount: 1, // 10 pts => Total 45 pts
    };

    const result = calculateCreditScore(studentWithDelay);
    expect(result.totalScore).toBe(45);
    expect(result.maxAllowedAmount).toBe(60); // Nivel intermedio tras 1 préstamo
  });
});

describe('Validaciones de Parámetros de Solicitud de Crédito (Secciones 8.2 y 8.3)', () => {
  const mockSeniorScore = {
    totalScore: 80,
    academicScore: 40,
    financialScore: 40,
    breakdown: { gpaPoints: 20, semesterPoints: 20, historyPoints: 20, progressionPoints: 20 },
    maxAllowedAmount: 90,
    unlockedTermsWeeks: [1, 2, 4, 8],
    isEligible: true,
  };

  const mockJuniorScore = {
    ...mockSeniorScore,
    totalScore: 55,
    maxAllowedAmount: 30,
    unlockedTermsWeeks: [1, 2, 4],
  };

  it('debe rechazar montos inferiores al mínimo de $10 USD o que superen el cupo asignado al estudiante', () => {
    expect(validateLoanRequestParams(5, 1, mockSeniorScore).valid).toBe(false);
    expect(validateLoanRequestParams(50, 4, mockJuniorScore).valid).toBe(false); // Su tope es 30
    expect(validateLoanRequestParams(30, 4, mockJuniorScore).valid).toBe(true);
  });

  it('debe cumplir la regla estricta: la opción de 60 días (8 semanas) solo se autoriza si el monto es exactamente $90.00 USD', () => {
    // Intento de usar 8 semanas (60 días) con $80 USD -> Rechazado
    const badAttempt = validateLoanRequestParams(80, 8, mockSeniorScore);
    expect(badAttempt.valid).toBe(false);
    expect(badAttempt.error).toContain('$90.00');

    // Intento con $90 USD y 8 semanas -> Aprobado
    const goodAttempt = validateLoanRequestParams(90, 8, mockSeniorScore);
    expect(goodAttempt.valid).toBe(true);
  });
});
