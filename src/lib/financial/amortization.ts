/**
 * Motor Financiero y de Amortización Semanal (EduCréditoEC v1.1.0).
 * Aplica tasa fija universitaria del 8.50% anual, cuotas semanales fijas (C_w) y regla del período de gracia para días lunes.
 */

export const ANNUAL_INTEREST_RATE = 8.50; // 8.50% anual
export const WEEKS_IN_YEAR = 52;
export const WEEKLY_INTEREST_RATE_DECIMAL = (ANNUAL_INTEREST_RATE / WEEKS_IN_YEAR) / 100; // ~0.0016346

export interface AmortizationInstallment {
  installmentNumber: number; // 1, 2, ..., n
  dueDate: Date;             // Exclusivamente un día lunes
  amount: number;            // Cuota fija (C_w) en USD
  principal: number;         // Abono al capital
  interest: number;          // Pago de interés
  remainingBalance: number;  // Saldo pendiente del crédito
  status: 'pending' | 'paid' | 'overdue';
}

export interface AmortizationScheduleResult {
  principalAmount: number;
  termWeeks: number;
  weeklyPaymentAmount: number;
  totalRepayment: number;
  totalInterest: number;
  firstDueDate: Date;
  lastDueDate: Date;
  schedule: AmortizationInstallment[];
}

/**
 * Regla del Primer Pago (Sección 4.2):
 * Si el crédito se aprueba en cualquier día de la semana (ej: Viernes 7 de agosto),
 * el primer pago no vence el lunes inmediato (10 de agosto), sino después de una semana completa,
 * en el lunes de la semana subsiguiente (Lunes 17 de agosto).
 */
export function calculateFirstMondayDueDate(approvalDate: Date): Date {
  const date = new Date(approvalDate.getTime());
  const currentDay = date.getDay(); // 0 = Domingo, 1 = Lunes, 2 = Martes, ..., 6 = Sábado
  
  // Calcular días para el lunes inmediato
  let daysToNextMonday = (1 - currentDay + 7) % 7;
  if (daysToNextMonday === 0) {
    daysToNextMonday = 7; // Si hoy ya es lunes, el lunes inmediato es en 7 días
  }

  // Lunes de la semana subsiguiente = lunes inmediato + 7 días adicionales (semana de gracia)
  const totalDaysToAdd = daysToNextMonday + 7;
  
  date.setDate(date.getDate() + totalDaysToAdd);
  date.setHours(12, 0, 0, 0); // Fijar al mediodía para evitar problemas de zona horaria / UTC
  return date;
}

/**
 * Calcula la Cuota Semanal Fija (C_w) según Sección 6.2:
 * C_w = P * (i_w * (1 + i_w)^n) / ((1 + i_w)^n - 1)
 */
export function calculateWeeklyInstallmentAmount(principal: number, weeks: number): number {
  if (weeks <= 0 || principal <= 0) return 0;

  const i = WEEKLY_INTEREST_RATE_DECIMAL;
  const numerator = i * Math.pow(1 + i, weeks);
  const denominator = Math.pow(1 + i, weeks) - 1;

  const exactWeeklyPayment = principal * (numerator / denominator);
  return Math.round(exactWeeklyPayment * 100) / 100; // Redondear a 2 decimales (centavos de dólar)
}

/**
 * Genera la tabla completa de amortización con cuotas en días lunes consecutivos
 */
export function generateAmortizationSchedule(principal: number, termWeeks: number, approvalDate: Date = new Date()): AmortizationScheduleResult {
  const weeklyPayment = calculateWeeklyInstallmentAmount(principal, termWeeks);
  const schedule: AmortizationInstallment[] = [];

  let balance = principal;
  let totalInterest = 0;
  let firstDueDate = calculateFirstMondayDueDate(approvalDate);
  let currentDueDate = new Date(firstDueDate.getTime());

  for (let k = 1; k <= termWeeks; k++) {
    // Interés de la semana = Saldo restante anterior * tasa semanal
    const exactInterest = balance * WEEKLY_INTEREST_RATE_DECIMAL;
    let interest = Math.round(exactInterest * 100) / 100;
    let principalPart = Math.round((weeklyPayment - interest) * 100) / 100;
    let installmentAmount = weeklyPayment;

    // Ajuste contable en la última cuota para evitar descuadros de centavos
    if (k === termWeeks || principalPart > balance) {
      principalPart = Math.round(balance * 100) / 100;
      installmentAmount = Math.round((principalPart + interest) * 100) / 100;
      balance = 0;
    } else {
      balance = Math.round((balance - principalPart) * 100) / 100;
    }

    totalInterest += interest;

    schedule.push({
      installmentNumber: k,
      dueDate: new Date(currentDueDate.getTime()),
      amount: installmentAmount,
      principal: principalPart,
      interest: interest,
      remainingBalance: Math.max(0, balance),
      status: 'pending',
    });

    // Siguiente cuota: sumar 7 días exactos para el siguiente lunes
    currentDueDate.setDate(currentDueDate.getDate() + 7);
  }

  const totalRepayment = Math.round((principal + totalInterest) * 100) / 100;

  return {
    principalAmount: principal,
    termWeeks,
    weeklyPaymentAmount: weeklyPayment,
    totalRepayment,
    totalInterest: Math.round(totalInterest * 100) / 100,
    firstDueDate: schedule[0]?.dueDate || firstDueDate,
    lastDueDate: schedule[schedule.length - 1]?.dueDate || firstDueDate,
    schedule,
  };
}
