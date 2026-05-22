export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

export function getUserFriendlyError(error: unknown): string {
  const msg = getErrorMessage(error);

  for (const [code, friendly] of Object.entries(FIREBASE_ERROR_MAP)) {
    if (msg.includes(code)) return friendly;
  }

  return 'Something went wrong. Please try again.';
}
