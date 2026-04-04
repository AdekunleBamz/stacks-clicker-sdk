export interface ValidationResult {
  valid: boolean;
  address?: string;
  error?: string;
}

const STACKS_ADDRESS_PATTERN = /^S[PT][0-9A-HJ-NP-Z]{27,38}$/;

export function formatAddress(
  address: string | null | undefined,
  start = 6,
  end = 4,
): string {
  if (typeof address !== 'string') {
    return '';
  }

  const normalized = address.trim();
  if (normalized.length <= start + end) {
    return normalized;
  }

  return `${normalized.slice(0, start)}...${normalized.slice(-end)}`;
}

export function validateStacksAddressResult(address: unknown): ValidationResult {
  if (typeof address !== 'string') {
    return { valid: false, error: 'Address must be a string.' };
  }

  const normalized = address.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: 'Address is required.' };
  }

  if (!STACKS_ADDRESS_PATTERN.test(normalized)) {
    return {
      valid: false,
      address: normalized,
      error: 'Address must be a valid Stacks address.',
    };
  }

  return { valid: true, address: normalized };
}

export function validateStacksAddress(address: unknown): boolean {
  return validateStacksAddressResult(address).valid;
}

export async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  const maxAttempts = Number.isInteger(retries) && retries > 0 ? retries : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error('Retry exhausted without executing the operation.');
}
