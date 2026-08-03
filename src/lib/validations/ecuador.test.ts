import { describe, it, expect } from 'vitest';
import { validateEcuadorianCedula, validateUtbEmail } from './ecuador';

describe('Motor de Validación Legal - Cédula Ecuatoriana (Módulo 10)', () => {
  it('debe validar como correctas las cédulas ecuatorianas reales/válidas por Módulo 10', () => {
    // Cédulas matemáticamente válidas según el Módulo 10
    expect(validateEcuadorianCedula('1710034065')).toBe(true);
    expect(validateEcuadorianCedula('0923456784')).toBe(true); // Suma = 46 -> 10 - 6 = 4
    expect(validateEcuadorianCedula('0102030400')).toBe(true); // Suma = 10 -> Residuo 0 -> 0
  });

  it('debe rechazar cédulas con longitud incorrecta o caracteres no numéricos', () => {
    expect(validateEcuadorianCedula('171003406')).toBe(false); // 9 dígitos
    expect(validateEcuadorianCedula('17100340655')).toBe(false); // 11 dígitos
    expect(validateEcuadorianCedula('171003406A')).toBe(false); // Letra
    expect(validateEcuadorianCedula('')).toBe(false); // Vacío
  });

  it('debe rechazar códigos de provincia inválidos (menores a 01 o mayores a 24, excepto 30)', () => {
    expect(validateEcuadorianCedula('0010034065')).toBe(false); // Provincia 00
    expect(validateEcuadorianCedula('2510034065')).toBe(false); // Provincia 25 (inválida)
    expect(validateEcuadorianCedula('9910034065')).toBe(false); // Provincia 99
  });

  it('debe rechazar tercer dígito superior o igual a 6 (personas no naturales o inválidas para créditos)', () => {
    // Tercer dígito es 6 (asociado a empresas públicas/jurídicas, no elegibles para microcrédito estudiantil)
    expect(validateEcuadorianCedula('1760034065')).toBe(false);
    expect(validateEcuadorianCedula('1790034065')).toBe(false);
  });

  it('debe rechazar cédulas cuyo dígito verificador no coincida con la fórmula Módulo 10', () => {
    expect(validateEcuadorianCedula('1710034060')).toBe(false); // El último debería ser 5, no 0
    expect(validateEcuadorianCedula('0923456789')).toBe(false); // El último debería ser 3, no 9
  });
});

describe('Validación de Correos Institucionales UTB', () => {
  it('debe aceptar correos institucionales de facultades o dominio general UTB', () => {
    expect(validateUtbEmail('estudiante@fafi.utb.edu.ec')).toBe(true);
    expect(validateUtbEmail('docente@fcj3.utb.edu.ec')).toBe(true);
    expect(validateUtbEmail('administrador@utb.edu.ec')).toBe(true);
  });

  it('debe rechazar correos comerciales o personales', () => {
    expect(validateUtbEmail('estudiante@gmail.com')).toBe(false);
    expect(validateUtbEmail('usuario@outlook.es')).toBe(false);
  });
});
