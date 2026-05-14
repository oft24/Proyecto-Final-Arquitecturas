/**
 * Utilidades para manejo correcto de fechas y timezones
 * La aplicación asume zona horaria: América Central (UTC-6)
 * Evita problemas de desfase entre frontend y backend
 */

// Offset de zona horaria: UTC-6 (México/Centroamérica)
const TIMEZONE_OFFSET_HOURS = 6;
const TIMEZONE_OFFSET_MS = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Convierte una fecha ISO (UTC) a formato YYYY-MM-DD en zona horaria local (UTC-6)
 * @param isoString - Fecha en formato ISO8601 (ej: "2026-05-14T10:30:00.000Z")
 * @returns Fecha en formato YYYY-MM-DD según zona local (ej: "2026-05-14")
 */
export function isoToLocalDateString(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Convertir de UTC a UTC-6 (restar 6 horas)
  const localTime = new Date(date.getTime() - TIMEZONE_OFFSET_MS);
  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localTime.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un string de fecha YYYY-MM-DD a ISO8601 UTC
 * Interpreta la fecha como medianoche en zona horaria local (UTC-6)
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2026-05-14")
 * @returns Fecha en formato ISO8601 UTC (ej: "2026-05-14T06:00:00Z" porque UTC-6)
 */
export function localDateStringToISO(dateString: string): string {
  if (!dateString) return "";
  
  // Parsear "YYYY-MM-DD"
  const [year, month, day] = dateString.split("-").map(Number);
  
  // Crear fecha como si fuera medianoche en UTC-6
  // "2026-05-14 00:00 UTC-6" en UTC = "2026-05-14 06:00:00Z"
  const dateLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const dateUTC = new Date(dateLocal.getTime() + TIMEZONE_OFFSET_MS);
  
  return dateUTC.toISOString();
}

/**
 * Extrae solo la hora de una ISO string en zona local (UTC-6)
 * @param isoString - Fecha ISO con hora (ej: "2026-05-14T21:30:00.000Z" = 15:30 local)
 * @returns Hora en formato HH:mm local (ej: "15:30")
 */
export function isoToTimeString(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Convertir a zona local (UTC-6)
  const localTime = new Date(date.getTime() - TIMEZONE_OFFSET_MS);
  const hours = String(localTime.getUTCHours()).padStart(2, "0");
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formatea una fecha ISO para mostrar al usuario en zona local
 * @param isoString - Fecha en formato ISO8601
 * @param includeTime - Si incluir la hora
 * @returns Fecha formateada (ej: "14 mayo 2026, 15:30")
 */
export function formatDateForDisplay(
  isoString: string,
  includeTime = false
): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Convertir a zona local (UTC-6)
  const localTime = new Date(date.getTime() - TIMEZONE_OFFSET_MS);
  
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",  // UTC-6
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  
  return localTime.toLocaleDateString("es-ES", options);
}

/**
 * Valida si una fecha string es válida
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si es válida, false si no
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  const [year, month, day] = dateString.split("-").map(Number);
  
  // Validar rango de mes y día
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Validar con Date
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
