import { describe, it, expect } from 'vitest';
import { earlierThenTargetDate, withinTargetDate } from '../lib/target-date';

describe('earlierThenTargetDate', () => {
  it('should return true when post time is before target date', () => {
    const postTime = new Date('2024-02-14T12:00:00Z');
    const targetDate = '20240215';
    expect(earlierThenTargetDate(postTime, targetDate)).toBe(true);
  });

  it('should return false when post time is on target date', () => {
    const postTime = new Date('2024-02-15T12:00:00Z');
    const targetDate = '20240215';
    expect(earlierThenTargetDate(postTime, targetDate)).toBe(false);
  });

  it('should return false when post time is after target date', () => {
    const postTime = new Date('2024-02-16T12:00:00Z');
    const targetDate = '20240215';
    expect(earlierThenTargetDate(postTime, targetDate)).toBe(false);
  });

  it('should handle timezone offset correctly', () => {
    // Testing with UTC+8
    const postTime = new Date('2024-02-15T02:00:00Z'); // 10:00 AM in UTC+8
    const targetDate = '20240215';
    expect(earlierThenTargetDate(postTime, targetDate, 8)).toBe(false);
    expect(earlierThenTargetDate(postTime, targetDate, 0)).toBe(false);
  });

  it('should handle edge case at start of day', () => {
    const postTime = new Date('2024-02-15T00:00:00Z');
    const targetDate = '20240215';
    expect(earlierThenTargetDate(postTime, targetDate)).toBe(false);
  });
});

describe('withinTargetDate', () => {
  it('should return true when post time is within target date', () => {
    const postTime = new Date('2024-02-15T12:00:00Z');
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate)).toBe(true);
  });

  it('should return false when post time is before target date', () => {
    const postTime = new Date('2024-02-14T12:00:00Z');
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate)).toBe(false);
  });

  it('should return false when post time is after target date', () => {
    const postTime = new Date('2024-02-16T12:00:00Z');
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate)).toBe(false);
  });

  it('should handle timezone offset correctly for start of day', () => {
    // Testing with UTC+8
    const postTime = new Date('2024-02-14T16:00:00Z'); // 00:00 AM previous day in UTC+8
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate, 8)).toBe(true);
  });

  it('should handle timezone offset correctly for end of day', () => {
    // Testing with UTC+8
    const postTime = new Date('2024-02-15T15:59:59Z'); // 23:59 AM current day in UTC+8
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate, 8)).toBe(true);
  });

  it('should include start of day', () => {
    const postTime = new Date('2024-02-15T00:00:00Z');
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate)).toBe(true);
  });

  it('should include end of day', () => {
    const postTime = new Date('2024-02-15T23:59:59.999Z');
    const targetDate = '20240215';
    expect(withinTargetDate(postTime, targetDate)).toBe(true);
  });

  it('should handle invalid date format gracefully', () => {
    const postTime = new Date('2024-02-15T12:00:00Z');
    const targetDate = 'invalid';
    expect(() => withinTargetDate(postTime, targetDate)).toThrow();
  });
});
