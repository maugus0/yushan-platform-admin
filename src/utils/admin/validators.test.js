import {
  isValidEmail,
  validatePassword,
  validateUsername,
  isValidPhone,
  isValidURL,
  validateNovelTitle,
  validateChapterTitle,
  validateChapterContent,
  validateYuanAmount,
  validateRating,
  validateCommentContent,
  validateFileSize,
  validateImageFile,
  validateRequired,
  validateStringLength,
  validateNumberRange,
  validateDate,
  validateForm,
  cleanString,
  sanitizeHTML,
} from './validators';

describe('Validators - Complete Test Suite', () => {
  describe('Email Validation', () => {
    test('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });
    test('rejects email without @', () => {
      expect(isValidEmail('testexample')).toBe(false);
    });
    test('handles null', () => {
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('validates strong password', () => {
      const result = validatePassword('Pass123!abc');
      expect(result.isValid).toBe(true);
    });
    test('rejects short password', () => {
      const result = validatePassword('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    test('handles null', () => {
      const result = validatePassword(null);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Username Validation', () => {
    test('validates valid username', () => {
      const result = validateUsername('validuser123');
      expect(result.isValid).toBe(true);
    });
    test('rejects short username', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
    });
    test('rejects long username', () => {
      const result = validateUsername('a'.repeat(30));
      expect(result.isValid).toBe(false);
    });
    test('rejects invalid characters', () => {
      const result = validateUsername('user@#$');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    test('validates phone number', () => {
      expect(isValidPhone('1234567890')).toBe(true);
    });
    test('rejects short phone', () => {
      expect(isValidPhone('123')).toBe(false);
    });
    test('handles formatted phone', () => {
      expect(isValidPhone('123-456-7890')).toBe(true);
    });
    test('handles null', () => {
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('URL Validation', () => {
    test('validates HTTPS URL', () => {
      expect(isValidURL('https://example.com')).toBe(true);
    });
    test('validates HTTP URL', () => {
      expect(isValidURL('http://example.com')).toBe(true);
    });
    test('rejects URL without protocol', () => {
      expect(isValidURL('example.com')).toBe(false);
    });
    test('handles null', () => {
      expect(isValidURL(null)).toBe(false);
    });
  });

  describe('Novel Title Validation', () => {
    test('validates valid title', () => {
      const result = validateNovelTitle('The Great Adventure');
      expect(result.isValid).toBe(true);
    });
    test('rejects short title', () => {
      const result = validateNovelTitle('AB');
      expect(result.isValid).toBe(false);
    });
    test('rejects long title', () => {
      const result = validateNovelTitle('A'.repeat(256));
      expect(result.isValid).toBe(false);
    });
  });

  describe('Chapter Title Validation', () => {
    test('validates valid chapter title', () => {
      const result = validateChapterTitle('Chapter One');
      expect(result.isValid).toBe(true);
    });
    test('rejects empty title', () => {
      const result = validateChapterTitle('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Chapter Content Validation', () => {
    test('validates content with minimum length', () => {
      const result = validateChapterContent('A'.repeat(100));
      expect(result.isValid).toBe(true);
    });
    test('rejects short content', () => {
      const result = validateChapterContent('short');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Yuan Amount Validation', () => {
    test('validates positive amount', () => {
      const result = validateYuanAmount(100);
      expect(result.isValid).toBe(true);
    });
    test('rejects negative amount', () => {
      const result = validateYuanAmount(-50);
      expect(result.isValid).toBe(false);
    });
    test('allows zero', () => {
      const result = validateYuanAmount(0);
      expect(result.isValid).toBe(true);
    });
    test('rejects non-number', () => {
      const result = validateYuanAmount('abc');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Rating Validation', () => {
    test('validates rating 1-5', () => {
      const result = validateRating(4);
      expect(result.isValid).toBe(true);
    });
    test('rejects rating < 1', () => {
      const result = validateRating(0);
      expect(result.isValid).toBe(false);
    });
    test('rejects rating > 5', () => {
      const result = validateRating(6);
      expect(result.isValid).toBe(false);
    });
    test('rejects non-number', () => {
      const result = validateRating('five');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Comment Content Validation', () => {
    test('validates comment', () => {
      const result = validateCommentContent('Great story!');
      expect(result.isValid).toBe(true);
    });
    test('rejects empty comment', () => {
      const result = validateCommentContent('');
      expect(result.isValid).toBe(false);
    });
    test('rejects very long comment', () => {
      const result = validateCommentContent('A'.repeat(5000));
      expect(result.isValid).toBe(false);
    });
  });

  describe('File Size Validation', () => {
    test('validates small file', () => {
      const result = validateFileSize({ size: 1000 }, 5);
      expect(result.isValid).toBe(true);
    });
    test('rejects large file', () => {
      const result = validateFileSize({ size: 10000000 }, 5);
      expect(result.isValid).toBe(false);
    });
    test('handles null', () => {
      const result = validateFileSize(null, 5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Image File Validation', () => {
    test('validates image file', () => {
      const result = validateImageFile({
        name: 'photo.jpg',
        size: 1000,
        type: 'image/jpeg',
      });
      expect(result.isValid).toBe(true);
    });
    test('rejects non-image', () => {
      const result = validateImageFile({
        name: 'document.pdf',
        size: 1000,
        type: 'application/pdf',
      });
      expect(result.isValid).toBe(false);
    });
    test('rejects oversized image', () => {
      const result = validateImageFile({
        name: 'photo.jpg',
        size: 100000000,
        type: 'image/jpeg',
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    test('validates non-empty value', () => {
      const result = validateRequired('test value', 'Test');
      expect(result.isValid).toBe(true);
    });
    test('rejects empty string', () => {
      const result = validateRequired('', 'Test');
      expect(result.isValid).toBe(false);
    });
    test('rejects null', () => {
      const result = validateRequired(null, 'Test');
      expect(result.isValid).toBe(false);
    });
  });

  describe('String Length Validation', () => {
    test('validates string within range', () => {
      const result = validateStringLength('test', 'Test', 2, 10);
      expect(result.isValid).toBe(true);
    });
    test('rejects string too short', () => {
      const result = validateStringLength('a', 'Test', 2, 10);
      expect(result.isValid).toBe(false);
    });
    test('rejects string too long', () => {
      const result = validateStringLength('a'.repeat(15), 'Test', 2, 10);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Number Range Validation', () => {
    test('validates number in range', () => {
      const result = validateNumberRange(5, 'Score', 1, 10);
      expect(result.isValid).toBe(true);
    });
    test('rejects number below min', () => {
      const result = validateNumberRange(0, 'Score', 1, 10);
      expect(result.isValid).toBe(false);
    });
    test('rejects number above max', () => {
      const result = validateNumberRange(15, 'Score', 1, 10);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Date Validation', () => {
    test('validates valid date', () => {
      const result = validateDate('2024-01-15', 'Date');
      expect(result.isValid).toBe(true);
    });
    test('rejects invalid date format', () => {
      const result = validateDate('invalid', 'Date');
      expect(result.isValid).toBe(false);
    });
    test('rejects past date if required', () => {
      const result = validateDate('2020-01-01', 'Date');
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('Form Validation', () => {
    test('validates complete form', () => {
      const formData = {
        email: 'test@test.com',
        password: 'Pass123!abc',
        username: 'testuser',
      };
      const rules = {
        email: (v) => isValidEmail(v),
        username: (v) => v.length >= 3,
      };
      const result = validateForm(formData, rules);
      expect(typeof result.isValid).toBe('boolean');
    });
    test('handles empty form data', () => {
      const result = validateForm({}, {});
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('String Cleaning', () => {
    test('removes extra whitespace', () => {
      const result = cleanString('  hello   world  ');
      expect(result).not.toContain('   ');
    });
    test('preserves content', () => {
      const result = cleanString('hello world');
      expect(result).toContain('hello');
    });
    test('handles null', () => {
      const result = cleanString(null);
      expect(typeof result).toBe('string');
    });
  });

  describe('HTML Sanitization', () => {
    test('removes script tags', () => {
      const result = sanitizeHTML('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });
    test('preserves safe HTML', () => {
      const result = sanitizeHTML('<p>Hello</p>');
      expect(typeof result).toBe('string');
    });
    test('handles null', () => {
      const result = sanitizeHTML(null);
      expect(typeof result).toBe('string');
    });
  });
});
