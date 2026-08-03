import { describe, it, expect } from 'vitest';
import {
  calculateFirstMondayDueDate,
  calculateWeeklyInstallmentAmount,
  generateAmortizationSchedule,
  ANNUAL_INTEREST_RATE
} from './amortization';

describe('Motor Financiero y Amortización Semanal - Regla del Período de Gracia (Sección 4.2)', () => {
  it('debe calcular correctamente el ejemplo oficial: Crédito aprobado el Viernes 7 de agosto tiene primer pago el Lunes 17 de agosto', () => {
    // Viernes 7 de agosto de 2026
    const approvalDate = new Date(2026, 7, 7); // Mes 7 = Agosto (0-indexed en JS Date)
    expect(approvalDate.getDay()).toBe(5); // 5 = Viernes

    const firstDueDate = calculateFirstMondayDueDate(approvalDate);
    expect(firstDueDate.getDay()).toBe(1); // 1 = Lunes
    expect(firstDueDate.getFullYear()).toBe(2026);
    expect(firstDueDate.getMonth()).toBe(7); // Agosto
    expect(firstDueDate.getDate()).toBe(17); // Lunes 17 de agosto
  });

  it('debe otorgar al menos una semana completa de margen cuando se apruebe un día miércoles', () => {
    // Miércoles 5 de agosto de 2026
    const approvalDate = new Date(2026, 7, 5);
    const firstDueDate = calculateFirstMondayDueDate(approvalDate);
    expect(firstDueDate.getDay()).toBe(1);
    expect(firstDueDate.getDate()).toBe(17); // Salta el lunes 10, va al lunes 17
  });
});

describe('Fórmula de Cuota Semanal C_w (Sección 6.2)', () => {
  it('debe calcular con precisión de centavo las cuotas fijas para microcréditos típicos de la UTB', () => {
    // Tasa anual del 8.50%
    expect(ANNUAL_INTEREST_RATE).toBe(8.50);

    // Para $90 USD a 8 semanas (60 días):
    const cuota90 = calculateWeeklyInstallmentAmount(90, 8);
    expect(cuota90).toBeGreaterThan(11.00);
    expect(cuota90).toBeLessThan(12.00); // Aprox 11.33 USD por semana

    // Para $30 USD a 4 semanas (30 días):
    const cuota30 = calculateWeeklyInstallmentAmount(30, 4);
    expect(cuota30).toBeGreaterThan(7.50);
    expect(cuota30).toBeLessThan(7.60); // Aprox 7.53 USD por semana
  });
});

describe('Generador del Calendario de Amortización Completo', () => {
  it('debe generar una tabla donde TODAS las fechas de vencimiento sean exclusivamente días lunes consecutivos', () => {
    const approvalDate = new Date(2026, 7, 7); // Viernes 7 de agosto
    const result = generateAmortizationSchedule(60, 4, approvalDate); // $60 USD a 4 semanas

    expect(result.schedule).toHaveLength(4);
    expect(result.principalAmount).toBe(60);
    expect(result.schedule[result.schedule.length - 1].remainingBalance).toBe(0);

    // Verificar que cada fecha de cuota sea un lunes
    result.schedule.forEach((installment, idx) => {
      expect(installment.dueDate.getDay()).toBe(1); // Siempre lunes
      if (idx > 0) {
        // La diferencia entre cuota anterior y actual debe ser exactamente de 7 días (una semana)
        const daysDiff = (installment.dueDate.getTime() - result.schedule[idx - 1].dueDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(7);
      }
    });
  });

  it('debe cuadrar el capital amortizado y extinguir el saldo al 100% en la última cuota', () => {
    const result = generateAmortizationSchedule(90, 8); // El préstamo tope de 60 días / 8 semanas
    const totalPrincipalPaid = result.schedule.reduce((acc, curr) => acc + curr.principal, 0);
    
    expect(Math.round(totalPrincipalPaid * 100) / 100).toBe(90.00);
    expect(result.schedule[7].remainingBalance).toBe(0);
  });
});
