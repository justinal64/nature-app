import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';

describe('validateEmail', () => {
  it('returns undefined for valid email', () => {
    expect(validateEmail('user@example.com')).toBeUndefined();
  });

  it('errors on empty string', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('errors on whitespace-only', () => {
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('errors on missing @', () => {
    expect(validateEmail('notanemail')).toBe('Please enter a valid email address.');
  });
});

describe('validatePassword', () => {
  it('returns undefined for valid password', () => {
    expect(validatePassword('abc123')).toBeUndefined();
  });

  it('errors on empty string', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('errors if shorter than 6 chars', () => {
    expect(validatePassword('abc')).toBe('Password must be at least 6 characters.');
  });
});

describe('validateRequired', () => {
  it('returns undefined when value present', () => {
    expect(validateRequired('hello', 'Name')).toBeUndefined();
  });

  it('errors on empty string', () => {
    expect(validateRequired('', 'Name')).toBe('Name is required.');
  });
});
