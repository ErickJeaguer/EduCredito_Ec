/**
 * Algoritmo oficial de validación de Cédula de Ciudadanía Ecuatoriana (Módulo 10).
 * Según Reglas de Negocio EduCréditoEC v1.1.0 - Sección 8.1
 */

export function validateEcuadorianCedula(cedula: string): boolean {
  // 1. Verificar que sea un string de exactamente 10 dígitos numéricos
  if (!cedula || typeof cedula !== 'string' || !/^\d{10}$/.test(cedula)) {
    return false;
  }

  // 2. Comprobación estricta del código de provincia (01 a 24, o 30 para ecuatorianos en el exterior)
  const provinceCode = parseInt(cedula.substring(0, 2), 10);
  const validProvince = (provinceCode >= 1 && provinceCode <= 24) || provinceCode === 30;
  if (!validProvince) {
    return false;
  }

  // 3. Comprobación del tercer dígito (debe ser menor a 6 para personas naturales)
  const thirdDigit = parseInt(cedula.charAt(2), 10);
  if (thirdDigit >= 6) {
    return false;
  }

  // 4. Algoritmo del Módulo 10 para verificar el dígito validador (dígito 10)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula.charAt(i), 10);
    // Posiciones impares (índices pares 0, 2, 4, 6, 8) se multiplican por 2
    if (i % 2 === 0) {
      val *= 2;
      if (val >= 10) {
        val -= 9;
      }
    }
    sum += val;
  }

  const remainder = sum % 10;
  const expectedVerifier = remainder === 0 ? 0 : 10 - remainder;
  const actualVerifier = parseInt(cedula.charAt(9), 10);

  return expectedVerifier === actualVerifier;
}

/**
 * Helper adicional para validar correos institucionales de la UTB
 */
export function validateUtbEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith('.utb.edu.ec') || email.trim().toLowerCase().endsWith('@utb.edu.ec');
}
