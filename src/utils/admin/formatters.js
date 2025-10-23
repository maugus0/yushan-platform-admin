// Yushan Admin Formatting Utilities

/**
 * Format currency (Yuan)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ¥)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '¥') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0.00`;
  }

  return `${currency}${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'datetime', 'time')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  };

  return dateObj.toLocaleDateString('zh-CN', options[format] || options.short);
};

/**
 * Format relative time (time ago)
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now - dateObj;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (weeks < 4) return `${weeks}周前`;
  if (months < 12) return `${months}个月前`;
  return `${years}年前`;
};

/**
 * Format duration (seconds to readable format)
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Chinese mobile number format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  // International format
  if (cleaned.length > 11) {
    return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }

  return phone;
};

/**
 * Format username/display name
 * @param {string} name - Name to format
 * @param {number} maxLength - Maximum length to display
 * @returns {string} - Formatted name
 */
export const formatDisplayName = (name, maxLength = 20) => {
  if (!name) return '';

  if (name.length <= maxLength) {
    return name;
  }

  return `${name.slice(0, maxLength - 3)}...`;
};

/**
 * Format status badge text
 * @param {string} status - Status value
 * @returns {string} - Formatted status text
 */
export const formatStatus = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃',
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    suspended: '已暂停',
    banned: '已封禁',
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    featured: '精选',
    trending: '热门',
    completed: '已完成',
    ongoing: '连载中',
    paused: '暂停',
    cancelled: '已取消',
    premium: '付费',
    free: '免费',
    vip: 'VIP',
    normal: '普通',
    high: '高',
    medium: '中',
    low: '低',
    urgent: '紧急',
    resolved: '已解决',
    investigating: '调查中',
    closed: '已关闭',
  };

  return statusMap[status] || status;
};

/**
 * Format priority level
 * @param {string|number} priority - Priority value
 * @returns {string} - Formatted priority text
 */
export const formatPriority = (priority) => {
  const priorityMap = {
    1: '低',
    2: '正常',
    3: '高',
    4: '紧急',
    5: '关键',
    low: '低',
    normal: '正常',
    medium: '中',
    high: '高',
    urgent: '紧急',
    critical: '关键',
  };

  return priorityMap[priority] || priority;
};

/**
 * Format novel genre
 * @param {string} genre - Genre value
 * @returns {string} - Formatted genre text
 */
export const formatGenre = (genre) => {
  const genreMap = {
    fantasy: '奇幻',
    romance: '言情',
    mystery: '悬疑',
    thriller: '惊悚',
    horror: '恐怖',
    scifi: '科幻',
    historical: '历史',
    contemporary: '现代',
    urban: '都市',
    martial_arts: '武侠',
    cultivation: '修真',
    system: '系统',
    reincarnation: '重生',
    transmigration: '穿越',
    slice_of_life: '日常',
    comedy: '喜剧',
    drama: '剧情',
    action: '动作',
    adventure: '冒险',
    supernatural: '超自然',
  };

  return genreMap[genre] || genre;
};

/**
 * Format rating stars
 * @param {number} rating - Rating value (0-5)
 * @param {boolean} showNumber - Whether to show number alongside stars
 * @returns {string} - Formatted rating string
 */
export const formatRating = (rating, showNumber = true) => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return '☆☆☆☆☆';
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '⭐';
  stars += '☆'.repeat(emptyStars);

  return showNumber ? `${stars} (${rating.toFixed(1)})` : stars;
};

/**
 * Format text excerpt
 * @param {string} text - Text to excerpt
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} - Formatted excerpt
 */
export const formatExcerpt = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  // Try to break at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + suffix;
  }

  return truncated + suffix;
};

/**
 * Format URL slug
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const formatSlug = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Format table column width
 * @param {string} content - Content to measure
 * @param {number} minWidth - Minimum width
 * @param {number} maxWidth - Maximum width
 * @returns {number} - Calculated width
 */
export const formatColumnWidth = (content, minWidth = 80, maxWidth = 300) => {
  if (!content) return minWidth;

  const length = content.toString().length;
  const calculatedWidth = Math.max(length * 8, minWidth);

  return Math.min(calculatedWidth, maxWidth);
};

/**
 * Format search query highlight
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} - Text with highlighted matches
 */
export const formatHighlight = (text, query) => {
  if (!text || !query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Format social media handle
 * @param {string} handle - Social media handle
 * @param {string} platform - Platform type
 * @returns {string} - Formatted handle
 */
export const formatSocialHandle = (handle, platform = 'general') => {
  if (!handle) return '';

  // Remove @ symbol if present
  const cleanHandle = handle.replace(/^@/, '');

  const prefixes = {
    twitter: '@',
    instagram: '@',
    weibo: '@',
    general: '@',
  };

  return `${prefixes[platform] || '@'}${cleanHandle}`;
};

/**
 * Format API response message
 * @param {string} message - Raw message
 * @param {string} type - Message type
 * @returns {string} - Formatted message
 */
export const formatMessage = (message, _type = 'info') => {
  if (!message) return '';

  // Capitalize first letter
  return message.charAt(0).toUpperCase() + message.slice(1);
};

/**
 * Format list of items
 * @param {Array} items - Array of items
 * @param {string} separator - Separator between items
 * @param {string} lastSeparator - Separator before last item
 * @returns {string} - Formatted list string
 */
export const formatList = (items, separator = ', ', lastSeparator = ' 和 ') => {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0].toString();
  }

  if (items.length === 2) {
    return items.join(lastSeparator);
  }

  const allButLast = items.slice(0, -1).join(separator);
  const last = items[items.length - 1];

  return `${allButLast}${lastSeparator}${last}`;
};

/**
 * Format reading time
 * @param {number} hours - Reading time in hours
 * @param {boolean} showUnit - Whether to show the unit
 * @returns {string} - Formatted reading time string
 */
export const formatReadingTime = (hours, showUnit = true) => {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return showUnit ? '0h' : '0';
  }

  // If less than 1 hour, show in minutes
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return showUnit ? `${minutes}min` : minutes.toString();
  }

  // Show in hours with 1 decimal place
  const formatted = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  return showUnit ? `${formatted}h` : formatted;
};

export default {
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
};
