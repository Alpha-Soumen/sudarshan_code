/**
 * Generates a simple pseudo-random unique token.
 * Note: For production, use a cryptographically secure random string generator (e.g., crypto.randomBytes).
 * @returns A unique token string.
 */
export function generateToken(): string {
  // Simple combination of timestamp and random number
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}
