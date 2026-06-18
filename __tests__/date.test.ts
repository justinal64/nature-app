import { formatRelativeDate } from '@/utils/date';

describe('formatRelativeDate', () => {
  function isoMinsAgo(mins: number) {
    return new Date(Date.now() - mins * 60_000).toISOString();
  }

  it('returns "Just now" for < 1 hour ago', () => {
    expect(formatRelativeDate(isoMinsAgo(30))).toBe('Just now');
  });

  it('returns hours for same-day entries', () => {
    expect(formatRelativeDate(isoMinsAgo(120))).toBe('2h ago');
  });

  it('returns "Yesterday" for ~25 hours ago', () => {
    const d = new Date(Date.now() - 25 * 3_600_000).toISOString();
    expect(formatRelativeDate(d)).toBe('Yesterday');
  });

  it('returns days for entries within a week', () => {
    const d = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(formatRelativeDate(d)).toBe('3d ago');
  });
});
