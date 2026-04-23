/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

/**
 * Validate number within range
 */
export function isNumberInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max && !isNaN(value);
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return typeof value === 'string' && value.length >= minLength;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Validate decimal places
 */
export function hasMaxDecimalPlaces(value: number, maxDecimals: number): boolean {
  const decimalPart = value.toString().split('.')[1];
  return !decimalPart || decimalPart.length <= maxDecimals;
}

/**
 * Validate Ethiopian phone number format
 */
export function isValidEthiopianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Ethiopian phone numbers typically start with 09 or +2519
  return /^(09|2519)\d{8}$/.test(cleaned);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumber;
}
