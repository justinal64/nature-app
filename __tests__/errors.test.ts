import { getUserFriendlyError } from '@/utils/errors';

describe('getUserFriendlyError', () => {
  it('maps auth/wrong-password', () => {
    expect(getUserFriendlyError(new Error('auth/wrong-password'))).toBe('Incorrect password.');
  });

  it('maps auth/user-not-found', () => {
    expect(getUserFriendlyError(new Error('auth/user-not-found'))).toBe(
      'No account found with this email.',
    );
  });

  it('maps auth/invalid-email', () => {
    expect(getUserFriendlyError(new Error('auth/invalid-email'))).toBe(
      'Please enter a valid email address.',
    );
  });

  it('maps auth/too-many-requests', () => {
    expect(getUserFriendlyError(new Error('auth/too-many-requests'))).toBe(
      'Too many attempts. Please try again later.',
    );
  });

  it('falls back for unknown errors', () => {
    expect(getUserFriendlyError(new Error('some-unknown-code'))).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('handles non-Error values', () => {
    expect(getUserFriendlyError('plain string')).toBe('Something went wrong. Please try again.');
  });
});
