import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatPhone,
  formatDisplayName,
  formatStatus,
  formatPriority,
  formatGenre,
  formatRating,
  formatExcerpt,
  formatSlug,
  formatColumnWidth,
  formatHighlight,
  formatSocialHandle,
  formatMessage,
  formatList,
  formatReadingTime,
} from './formatters';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    test('formats valid currency', () => {
      expect(formatCurrency(1000)).toBe('¥1,000.00');
    });

    test('formats currency with custom symbol', () => {
      expect(formatCurrency(1000, '$')).toBe('$1,000.00');
    });

    test('handles invalid input', () => {
      expect(formatCurrency('invalid')).toBe('¥0.00');
      expect(formatCurrency(null)).toBe('¥0.00');
    });

    test('formats decimal amounts', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56');
    });
  });

  describe('formatNumber', () => {
    test('formats number with default decimals', () => {
      expect(formatNumber(1000)).toBe('1,000');
    });

    test('formats number with custom decimals', () => {
      expect(formatNumber(1000.5, 2)).toBe('1,000.50');
    });

    test('handles invalid input', () => {
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber(null)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    test('formats percentage correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
    });

    test('formats percentage with custom decimals', () => {
      expect(formatPercentage(0.555, 2)).toBe('55.50%');
    });

    test('handles invalid input', () => {
      expect(formatPercentage('invalid')).toBe('0%');
      expect(formatPercentage(null)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    test('formats large file sizes', () => {
      const gb = 1024 * 1024 * 1024;
      expect(formatFileSize(gb)).toContain('GB');
    });
  });

  describe('formatDate', () => {
    test('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'short');
      expect(result).toBeTruthy();
    });

    test('handles empty date', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
    });

    test('handles date string', () => {
      const result = formatDate('2024-01-15', 'short');
      expect(result).toBeTruthy();
    });

    test('formats different date formats', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'long')).toBeTruthy();
      expect(formatDate(date, 'datetime')).toBeTruthy();
    });
  });

  describe('formatRelativeTime', () => {
    test('returns "刚刚" for seconds ago', () => {
      const d = new Date(Date.now() - 30 * 1000);
      expect(formatRelativeTime(d)).toBe('刚刚');
    });
    test('returns minutes/hours/days ago strings', () => {
      expect(formatRelativeTime(new Date(Date.now() - 90 * 1000))).toMatch(
        /分钟前/
      );
      expect(
        formatRelativeTime(new Date(Date.now() - 2 * 3600 * 1000))
      ).toMatch(/小时前/);
      expect(
        formatRelativeTime(new Date(Date.now() - 3 * 24 * 3600 * 1000))
      ).toMatch(/天前/);
    });
  });

  describe('formatDuration', () => {
    test('mm:ss for under an hour', () => {
      expect(formatDuration(65)).toBe('1:05');
    });
    test('hh:mm:ss for over an hour', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
    });
    test('invalid input returns 0:00', () => {
      expect(formatDuration('x')).toBe('0:00');
    });
  });

  describe('formatPhone', () => {
    test('formats Chinese mobile number (11 digits)', () => {
      expect(formatPhone('13812345678')).toBe('138 1234 5678');
    });
    test('formats international number with country code', () => {
      expect(formatPhone('+8613812345678')).toMatch(
        /^\+861 \d{3} \d{3} \d{4}$/
      );
    });
  });

  describe('formatDisplayName', () => {
    test('truncates and adds ellipsis when exceeding maxLength', () => {
      expect(formatDisplayName('abcdefgh', 5)).toBe('ab...');
    });
    test('returns original when within limit', () => {
      expect(formatDisplayName('abc', 5)).toBe('abc');
    });
  });

  describe('formatStatus', () => {
    test('maps known status to Chinese', () => {
      expect(formatStatus('active')).toBe('活跃');
    });
    test('unknown status returns original', () => {
      expect(formatStatus('custom')).toBe('custom');
    });
  });

  describe('formatPriority', () => {
    test('maps string and numeric priorities', () => {
      expect(formatPriority('high')).toBe('高');
      expect(formatPriority(5)).toBe('关键');
    });
  });

  describe('formatGenre', () => {
    test('maps known genre to Chinese', () => {
      expect(formatGenre('scifi')).toBe('科幻');
    });
  });

  describe('formatRating', () => {
    test('renders stars with number when valid', () => {
      const out = formatRating(4.5);
      expect(out).toMatch(/★/);
      expect(out).toMatch(/\(\d+\.\d\)/);
    });
    test('invalid rating returns empty stars', () => {
      expect(formatRating('x')).toBe('☆☆☆☆☆');
    });
    test('renders without number when showNumber=false', () => {
      const out = formatRating(3.5, false);
      expect(out).not.toMatch(/\(\d/);
    });
  });

  describe('formatExcerpt', () => {
    test('truncates and appends suffix', () => {
      const text = 'This is a long sentence with words';
      const out = formatExcerpt(text, 12);
      expect(out.endsWith('...')).toBe(true);
      expect(out.length).toBeLessThan(text.length);
    });
    test('returns original if short enough', () => {
      expect(formatExcerpt('short', 100)).toBe('short');
    });
  });

  describe('formatSlug', () => {
    test('lowercases and hyphenates', () => {
      expect(formatSlug('Hello World!')).toBe('hello-world');
    });
  });

  describe('formatColumnWidth', () => {
    test('respects min and max widths', () => {
      const min = 80;
      const max = 120;
      const w1 = formatColumnWidth('abc', min, max);
      expect(w1).toBeGreaterThanOrEqual(min);
      const w2 = formatColumnWidth('a'.repeat(1000), min, max);
      expect(w2).toBeLessThanOrEqual(max);
    });
  });

  describe('formatHighlight', () => {
    test('wraps matches with <mark>', () => {
      expect(formatHighlight('hello world', 'lo')).toBe(
        'hel<mark>lo</mark> world'
      );
    });
    test('no query returns original text', () => {
      expect(formatHighlight('hello', '')).toBe('hello');
    });
  });

  describe('formatSocialHandle', () => {
    test('normalizes handle with @ and platform prefix', () => {
      expect(formatSocialHandle('@jack', 'twitter')).toBe('@jack');
      expect(formatSocialHandle('jane', 'instagram')).toBe('@jane');
    });
  });

  describe('formatMessage', () => {
    test('capitalizes first letter', () => {
      expect(formatMessage('hello world')).toBe('Hello world');
    });
    test('empty returns empty', () => {
      expect(formatMessage('')).toBe('');
    });
  });

  describe('formatList', () => {
    test('joins items with separators', () => {
      expect(formatList([])).toBe('');
      expect(formatList(['a'])).toBe('a');
      expect(formatList(['a', 'b'])).toBe('a 和 b');
      expect(formatList(['a', 'b', 'c'])).toBe('a, b 和 c');
    });
  });

  describe('formatReadingTime', () => {
    test('less than 1 hour shows minutes', () => {
      expect(formatReadingTime(0.5)).toBe('30min');
    });
    test('hours with 1 decimal when needed', () => {
      expect(formatReadingTime(2.25)).toBe('2.3h');
    });
    test('invalid returns 0h by default', () => {
      expect(formatReadingTime('x')).toBe('0h');
    });
  });
});

test('formatCurrency with zero', () => {
  expect(formatCurrency(0)).toContain('0');
});

test('formatNumber handles large numbers', () => {
  expect(formatNumber(1000000)).toBeTruthy();
});

test('formatPercentage with edge cases', () => {
  expect(formatPercentage(1)).toBeTruthy();
});

test('formatFileSize with GB', () => {
  expect(formatFileSize(1024 * 1024 * 1024)).toContain('GB');
});

test('formatDate with different formats', () => {
  const date = new Date('2024-01-15');
  expect(formatDate(date, 'long')).toBeTruthy();
  expect(formatDate(date, 'datetime')).toBeTruthy();
});
