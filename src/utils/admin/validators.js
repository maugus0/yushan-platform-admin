// Yushan Admin Validation Utilities

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Username validation
 * @param {string} username - Username to validate
 * @returns {object} - Validation result
 */
export const validateUsername = (username) => {
  const errors = [];

  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username && username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push(
      'Username can only contain letters, numbers, underscores, and hyphens'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Novel title validation
 * @param {string} title - Novel title to validate
 * @returns {object} - Validation result
 */
export const validateNovelTitle = (title) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Novel title is required');
  }

  if (title && title.length < 3) {
    errors.push('Novel title must be at least 3 characters long');
  }

  if (title && title.length > 100) {
    errors.push('Novel title must be no more than 100 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Chapter title validation
 * @param {string} title - Chapter title to validate
 * @returns {object} - Validation result
 */
export const validateChapterTitle = (title) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Chapter title is required');
  }

  if (title && title.length < 3) {
    errors.push('Chapter title must be at least 3 characters long');
  }

  if (title && title.length > 200) {
    errors.push('Chapter title must be no more than 200 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Chapter content validation
 * @param {string} content - Chapter content to validate
 * @returns {object} - Validation result
 */
export const validateChapterContent = (content) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Chapter content is required');
  }

  if (content && content.length < 100) {
    errors.push('Chapter content must be at least 100 characters long');
  }

  if (content && content.length > 50000) {
    errors.push('Chapter content must be no more than 50,000 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Yuan amount validation
 * @param {number|string} amount - Yuan amount to validate
 * @returns {object} - Validation result
 */
export const validateYuanAmount = (amount) => {
  const errors = [];
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    errors.push('Yuan amount must be a valid number');
  }

  if (numAmount < 0) {
    errors.push('Yuan amount cannot be negative');
  }

  if (numAmount > 1000000) {
    errors.push('Yuan amount cannot exceed 1,000,000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Rating validation
 * @param {number|string} rating - Rating to validate (1-5)
 * @returns {object} - Validation result
 */
export const validateRating = (rating) => {
  const errors = [];
  const numRating = parseFloat(rating);

  if (isNaN(numRating)) {
    errors.push('Rating must be a valid number');
  }

  if (numRating < 1 || numRating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Comment content validation
 * @param {string} content - Comment content to validate
 * @returns {object} - Validation result
 */
export const validateCommentContent = (content) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Comment content is required');
  }

  if (content && content.length < 3) {
    errors.push('Comment must be at least 3 characters long');
  }

  if (content && content.length > 1000) {
    errors.push('Comment must be no more than 1000 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * File size validation
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {object} - Validation result
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Image file validation
 * @param {File} file - Image file to validate
 * @returns {object} - Validation result
 */
export const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Image file is required');
    return { isValid: false, errors };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be a valid image (JPEG, PNG, GIF, or WebP)');
  }

  // Check file size (max 5MB for images)
  const sizeValidation = validateFileSize(file, 5);
  if (!sizeValidation.isValid) {
    errors.push(...sizeValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} - Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  const errors = [];

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * String length validation
 * @param {string} value - String value to validate
 * @param {string} fieldName - Name of the field
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {object} - Validation result
 */
export const validateStringLength = (
  value,
  fieldName = 'Field',
  min = 0,
  max = Infinity
) => {
  const errors = [];

  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { isValid: false, errors };
  }

  if (value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters long`);
  }

  if (value.length > max) {
    errors.push(`${fieldName} must be no more than ${max} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Number range validation
 * @param {number} value - Number value to validate
 * @param {string} fieldName - Name of the field
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} - Validation result
 */
export const validateNumberRange = (
  value,
  fieldName = 'Field',
  min = -Infinity,
  max = Infinity
) => {
  const errors = [];
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
    return { isValid: false, errors };
  }

  if (numValue < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (numValue > max) {
    errors.push(`${fieldName} must be no more than ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Date validation
 * @param {string|Date} date - Date to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} - Validation result
 */
export const validateDate = (date, fieldName = 'Date') => {
  const errors = [];

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    errors.push(`${fieldName} must be a valid date`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Form validation helper
 * @param {object} formData - Form data to validate
 * @param {object} validationRules - Validation rules
 * @returns {object} - Validation result with field-specific errors
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];
    const fieldErrors = [];

    // Handle both single function and array of functions
    const ruleArray = Array.isArray(rules) ? rules : [rules];

    ruleArray.forEach((rule) => {
      const result = rule(value, field);
      // Handle both boolean results and object results with isValid property
      if (typeof result === 'boolean') {
        if (!result) {
          fieldErrors.push(`${field} validation failed`);
        }
      } else if (result && typeof result === 'object' && 'isValid' in result) {
        if (!result.isValid) {
          fieldErrors.push(...(result.errors || []));
        }
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
  };
};

/**
 * Clean and trim string values
 * @param {string} value - String to clean
 * @returns {string} - Cleaned string
 */
export const cleanString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize HTML content
 * @param {string} content - HTML content to sanitize
 * @returns {string} - Sanitized content
 */
export const sanitizeHTML = (content) => {
  if (typeof content !== 'string') return '';

  // Basic HTML sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

export default {
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
};
