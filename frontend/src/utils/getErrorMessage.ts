export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeError = error as Record<string, any>;

    if (typeof maybeError.error === 'string') return maybeError.error;
    if (typeof maybeError.message === 'string') return maybeError.message;
    if (typeof maybeError.code === 'string') return maybeError.code;

    try {
      return JSON.stringify(error);
    } catch {
      return fallback;
    }
  }

  return fallback;
}