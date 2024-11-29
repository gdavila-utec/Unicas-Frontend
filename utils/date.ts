import {
  format,
  isValid,
  parse,
  isFuture,
  differenceInYears,
  Locale,
} from 'date-fns';
import { es } from 'date-fns/locale';
// Error class for date-specific validation errors
export class DateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DateValidationError';
  }
}
/**
 * Formats a date string or Date object into a specified format
 * @param date - Date to format (string or Date object)
 * @param formatString - Format pattern (default: 'dd/MM/yyyy')
 * @param options - Additional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatString: string = 'dd/MM/yyyy',
  options: { locale?: Locale } = { locale: es }
): string {
  try {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObject)) {
      throw new DateValidationError('Invalid date provided');
    }
    return format(dateObject, formatString, options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}
/**
 * Formats a date for HTML date input fields (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(
  date: string | Date | null | undefined
): string {
  if (!date) return '';
  try {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObject)) {
      return '';
    }
    return format(dateObject, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

/**
 * Formats a date for API submission in ISO format
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDateForAPI(date: string | Date): string {
  if (!date) return '';
  try {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObject)) {
      throw new DateValidationError('Invalid date for API submission');
    }
    return dateObject.toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

/**
 * Validates a birth date to ensure the person is at least 18 years old
 * @param birthDate - Birth date to validate
 * @returns true if person is 18 or older
 */
export function isValidBirthDate(birthDate: string | Date): boolean {
  try {
    const dateObject =
      birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (!isValid(dateObject)) {
      return false;
    }
    const age = differenceInYears(new Date(), dateObject);
    return age >= 18;
  } catch (error) {
    console.error('Birth date validation error:', error);
    return false;
  }
}

/**
 * Validates a join date to ensure it's not in the future
 * @param joinDate - Join date to validate
 * @returns true if date is valid and not in the future
 */
export function isValidJoinDate(joinDate: string | Date): boolean {
  try {
    const dateObject = joinDate instanceof Date ? joinDate : new Date(joinDate);
    if (!isValid(dateObject)) {
      return false;
    }
    return !isFuture(dateObject);
  } catch (error) {
    console.error('Join date validation error:', error);
    return false;
  }
}

/**
 * Parses a date string in various formats into a Date object
 * @param dateString - Date string to parse
 * @param format - Expected format of the date string
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(
  dateString: string,
  format: string = 'dd/MM/yyyy'
): Date | null {
  try {
    const parsedDate = parse(dateString, format, new Date(), { locale: es });
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

/**
 * Checks if two dates are the same (ignoring time)
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if dates are the same
 */
export function isSameDate(
  date1: string | Date,
  date2: string | Date
): boolean {
  try {
    const d1 = formatDate(date1, 'yyyy-MM-dd');
    const d2 = formatDate(date2, 'yyyy-MM-dd');
    return d1 === d2;
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
}

// Common date format patterns used in the application
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  INPUT: 'yyyy-MM-dd',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Error messages for date validation
export const DATE_ERROR_MESSAGES = {
  INVALID_DATE: 'Fecha inválida',
  FUTURE_DATE: 'La fecha no puede ser futura',
  UNDERAGE: 'El miembro debe ser mayor de 18 años',
  PARSE_ERROR: 'Error al procesar la fecha',
} as const;
