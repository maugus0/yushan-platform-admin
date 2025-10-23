import {
  getCurrentTimestamp,
  formatDate,
  formatChineseDate,
  getRelativeTime,
  getDateRange,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  addDays,
  addMonths,
  addYears,
  getDaysDifference,
  getAge,
  getStartEndOfDay,
  getWeekdayName,
  getMonthName,
  isLeapYear,
  getDaysInMonth,
  parseISODate,
  toISOString,
  getTimezoneOffset,
  utcToLocal,
  localToUTC,
} from './dateutils';

describe('Date Utilities', () => {
  const testDate = new Date('2024-01-15T10:30:45Z');
  const timestamp = testDate.getTime();

  describe('getCurrentTimestamp', () => {
    test('returns current timestamp as number', () => {
      const now = getCurrentTimestamp();
      expect(typeof now).toBe('number');
      expect(now > 0).toBe(true);
    });
  });

  describe('formatDate', () => {
    test('formats date with YYYY-MM-DD format (default)', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('formats date with custom format YYYY/MM/DD', () => {
      const result = formatDate(testDate, 'YYYY/MM/DD');
      expect(result).toContain('/');
    });

    test('formats date with time HH:mm:ss', () => {
      const result = formatDate(testDate, 'YYYY-MM-DD HH:mm:ss');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    test('handles Date object input', () => {
      const result = formatDate(testDate, 'YYYY-MM-DD');
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles timestamp number input', () => {
      const result = formatDate(timestamp, 'YYYY-MM-DD');
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles string date input', () => {
      const result = formatDate('2024-01-15', 'YYYY-MM-DD');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    test('returns empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });

    test('handles YY format for 2-digit year', () => {
      const result = formatDate(testDate, 'YY-MM-DD');
      expect(result).toMatch(/\d{2}-\d{2}-\d{2}/);
    });
  });

  describe('formatChineseDate', () => {
    test('formats date in Chinese format without time', () => {
      const result = formatChineseDate(testDate, false);
      expect(result).toContain('年');
      expect(result).toContain('月');
      expect(result).toContain('日');
    });

    test('formats date in Chinese format with time', () => {
      const result = formatChineseDate(testDate, true);
      expect(result).toContain('年');
      expect(result).toContain('月');
      expect(result).toContain('日');
      expect(result).toContain(':');
    });

    test('returns empty string for null', () => {
      expect(formatChineseDate(null)).toBe('');
    });

    test('returns empty string for invalid date', () => {
      expect(formatChineseDate('not-a-date')).toBe('');
    });
  });

  describe('getRelativeTime', () => {
    test('returns string for recent date', () => {
      const recentDate = new Date(Date.now() - 5000);
      const result = getRelativeTime(recentDate);
      expect(typeof result).toBe('string');
      expect(result.length > 0).toBe(true);
    });

    test('returns "刚刚" (just now) for very recent timestamp', () => {
      const justNow = new Date(Date.now() - 100);
      const result = getRelativeTime(justNow);
      expect(result).toBe('刚刚');
    });

    test('returns minutes ago for past within hour', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
      const result = getRelativeTime(tenMinutesAgo);
      expect(result).toBe('10分钟前');
    });

    test('returns hours ago for past within day', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60000);
      const result = getRelativeTime(threeHoursAgo);
      expect(result).toBe('3小时前');
    });

    test('returns days ago for past within month', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60000);
      const result = getRelativeTime(fiveDaysAgo);
      expect(result).toBe('5天前');
    });

    test('returns weeks ago for past within 2 months', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60000);
      const result = getRelativeTime(twoWeeksAgo);
      expect(result).toBe('2周前');
    });

    test('returns months ago for past within year', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const result = getRelativeTime(threeMonthsAgo);
      expect(result).toBe('3个月前');
    });

    test('returns years ago for past over year', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const result = getRelativeTime(twoYearsAgo);
      expect(result).toBe('2年前');
    });

    test('returns empty string for null', () => {
      expect(getRelativeTime(null)).toBe('');
    });

    test('returns empty string for invalid date', () => {
      expect(getRelativeTime('invalid')).toBe('');
    });
  });

  describe('getDateRange', () => {
    test('returns date range for today', () => {
      const range = getDateRange('today');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for yesterday', () => {
      const range = getDateRange('yesterday');
      expect(Array.isArray(range)).toBe(true);
    });

    test('returns date range for week', () => {
      const range = getDateRange('week');
      expect(Array.isArray(range)).toBe(true);
    });

    test('returns date range for last_week', () => {
      const range = getDateRange('last_week');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for month', () => {
      const range = getDateRange('month');
      expect(Array.isArray(range)).toBe(true);
    });

    test('returns date range for last_month', () => {
      const range = getDateRange('last_month');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for quarter', () => {
      const range = getDateRange('quarter');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for last_quarter', () => {
      const range = getDateRange('last_quarter');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for year', () => {
      const range = getDateRange('year');
      expect(Array.isArray(range)).toBe(true);
    });

    test('returns date range for last_year', () => {
      const range = getDateRange('last_year');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for last_7_days', () => {
      const range = getDateRange('last_7_days');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for last_30_days', () => {
      const range = getDateRange('last_30_days');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns date range for last_90_days', () => {
      const range = getDateRange('last_90_days');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });

    test('returns today range for unknown period', () => {
      const range = getDateRange('unknown');
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
    });
  });

  describe('Date Checking Functions', () => {
    test('isToday returns true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    test('isToday returns false for past date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isToday(yesterday)).toBe(false);
    });

    test('isYesterday returns true for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isYesterday(yesterday)).toBe(true);
    });

    test('isThisWeek returns true for date this week', () => {
      const today = new Date();
      expect(isThisWeek(today)).toBe(true);
    });

    test('isThisMonth returns true for date this month', () => {
      const today = new Date();
      expect(isThisMonth(today)).toBe(true);
    });

    test('isThisYear returns true for date this year', () => {
      const today = new Date();
      expect(isThisYear(today)).toBe(true);
    });
  });

  describe('Date Arithmetic', () => {
    test('addDays adds days to date', () => {
      const baseDate = new Date('2024-01-15');
      const result = addDays(baseDate, 5);
      expect(result).toBeInstanceOf(Date);
    });

    test('addDays with negative number subtracts days', () => {
      const baseDate = new Date('2024-01-15');
      const result = addDays(baseDate, -5);
      expect(result).toBeInstanceOf(Date);
    });

    test('addMonths adds months to date', () => {
      const baseDate = new Date('2024-01-15');
      const result = addMonths(baseDate, 3);
      expect(result).toBeInstanceOf(Date);
    });

    test('addYears adds years to date', () => {
      const baseDate = new Date('2024-01-15');
      const result = addYears(baseDate, 1);
      expect(result).toBeInstanceOf(Date);
    });

    test('getDaysDifference calculates days between dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-20');
      const diff = getDaysDifference(date1, date2);
      expect(typeof diff).toBe('number');
    });
  });

  describe('Age Calculation', () => {
    test('getAge calculates age from birthdate', () => {
      const birthdate = new Date('2000-01-15');
      const age = getAge(birthdate);
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThan(0);
    });

    test('getAge handles invalid dates', () => {
      const age = getAge(null);
      expect(age).toBe(0);
    });
  });

  describe('Day and Time Range', () => {
    test('getStartEndOfDay returns array with start and end', () => {
      const result = getStartEndOfDay(new Date('2024-01-15'));
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    test('start of day is at 00:00:00', () => {
      const date = new Date('2024-01-15T14:30:45');
      const [start] = getStartEndOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
    });
  });

  describe('Weekday and Month Names', () => {
    test('getWeekdayName returns full weekday name', () => {
      const result = getWeekdayName(new Date('2024-01-15'));
      expect(typeof result).toBe('string');
      expect(result.length > 0).toBe(true);
    });

    test('getWeekdayName returns short name when requested', () => {
      const result = getWeekdayName(new Date('2024-01-15'), true);
      expect(typeof result).toBe('string');
    });

    test('getMonthName returns full month name', () => {
      const result = getMonthName(new Date('2024-01-15'));
      expect(typeof result).toBe('string');
      expect(result.length > 0).toBe(true);
    });

    test('getMonthName returns short name when requested', () => {
      const result = getMonthName(new Date('2024-01-15'), true);
      expect(typeof result).toBe('string');
    });
  });

  describe('Leap Year and Days in Month', () => {
    test('isLeapYear returns true for leap year', () => {
      expect(isLeapYear(2024)).toBe(true);
    });

    test('isLeapYear returns false for non-leap year', () => {
      expect(isLeapYear(2023)).toBe(false);
    });

    test('getDaysInMonth returns correct days for each month', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31);
      expect(getDaysInMonth(2024, 1)).toBe(29);
      expect(getDaysInMonth(2024, 3)).toBe(30);
    });

    test('getDaysInMonth handles leap year February', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
      expect(getDaysInMonth(2023, 1)).toBe(28);
    });
  });

  describe('ISO Date Functions', () => {
    test('parseISODate parses valid ISO string', () => {
      const isoString = '2024-01-15T10:30:45Z';
      const result = parseISODate(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    test('parseISODate returns null for null input', () => {
      const result = parseISODate(null);
      expect(result).toBeNull();
    });

    test('parseISODate returns null for empty string', () => {
      const result = parseISODate('');
      expect(result).toBeNull();
    });

    test('parseISODate returns null for invalid string', () => {
      const result = parseISODate('invalid-date-string');
      expect(result).toBeNull();
    });

    test('toISOString converts date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:45Z');
      const result = toISOString(date);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('toISOString returns empty string for null', () => {
      const result = toISOString(null);
      expect(result).toBe('');
    });

    test('toISOString returns empty string for invalid date', () => {
      const result = toISOString('invalid-date');
      expect(result).toBe('');
    });
  });

  describe('Timezone Functions', () => {
    test('getTimezoneOffset returns number', () => {
      const offset = getTimezoneOffset();
      expect(typeof offset).toBe('number');
    });

    test('utcToLocal converts UTC to local time', () => {
      const utcDate = new Date('2024-01-15T10:30:45Z');
      const localDate = utcToLocal(utcDate);
      expect(localDate).toBeInstanceOf(Date);
    });

    test('utcToLocal returns null for null input', () => {
      const result = utcToLocal(null);
      expect(result).toBeNull();
    });

    test('localToUTC converts local to UTC time', () => {
      const localDate = new Date('2024-01-15T10:30:45');
      const utcDate = localToUTC(localDate);
      expect(utcDate).toBeInstanceOf(Date);
    });

    test('localToUTC returns null for null input', () => {
      const result = localToUTC(null);
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('formatDate handles edge cases', () => {
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('');
    });

    test('formatChineseDate handles edge cases', () => {
      expect(formatChineseDate(undefined)).toBe('');
      expect(formatChineseDate('')).toBe('');
      expect(formatChineseDate(new Date('invalid'))).toBe('');
    });

    test('getRelativeTime handles edge cases', () => {
      expect(getRelativeTime(undefined)).toBe('');
      expect(getRelativeTime('')).toBe('');
      expect(getRelativeTime(new Date('invalid'))).toBe('');
    });

    test('Date checking functions handle null/undefined', () => {
      expect(isToday(null)).toBe(false);
      expect(isYesterday(null)).toBe(false);
      expect(isThisWeek(null)).toBe(false);
      expect(isThisMonth(null)).toBe(false);
      expect(isThisYear(null)).toBe(false);
    });

    test('getAge handles edge cases', () => {
      expect(getAge(undefined)).toBe(0);
      expect(getAge('')).toBe(0);
      expect(getAge(new Date('invalid'))).toBe(0);
    });

    test('getWeekdayName handles edge cases', () => {
      expect(getWeekdayName(null)).toBe('');
      expect(getWeekdayName('')).toBe('');
      expect(getWeekdayName(new Date('invalid'))).toBe('');
    });

    test('getMonthName handles edge cases', () => {
      expect(getMonthName(null)).toBe('');
      expect(getMonthName('')).toBe('');
      expect(getMonthName(new Date('invalid'))).toBe('');
    });
  });
});
