// Yushan Admin Date Utilities

/**
 * Get current timestamp
 * @returns {number} - Current timestamp in milliseconds
 */
export const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Format date to string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format pattern
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  const formatMap = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: seconds,
    YY: String(year).slice(-2),
    M: dateObj.getMonth() + 1,
    D: dateObj.getDate(),
    H: dateObj.getHours(),
    m: dateObj.getMinutes(),
    s: dateObj.getSeconds(),
  };

  let result = format;
  Object.keys(formatMap).forEach((key) => {
    result = result.replace(new RegExp(key, 'g'), formatMap[key]);
  });

  return result;
};

/**
 * Format date to Chinese format
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} - Formatted Chinese date string
 */
export const formatChineseDate = (date, includeTime = false) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  let result = `${year}年${month}月${day}日`;

  if (includeTime) {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    result += ` ${hours}:${String(minutes).padStart(2, '0')}`;
  }

  return result;
};

/**
 * Get relative time (time ago)
 * @param {Date|string|number} date - Date to compare
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const now = new Date();
  const diff = now - dateObj;

  if (isNaN(dateObj.getTime())) return '';

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
 * Get date range for common periods
 * @param {string} period - Period type ('today', 'yesterday', 'week', 'month', 'quarter', 'year')
 * @returns {Array} - Array with start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return [today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)];

    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return [
        yesterday,
        new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      ];
    }

    case 'week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return [startOfWeek, endOfWeek];
    }

    case 'last_week': {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return [lastWeekStart, lastWeekEnd];
    }

    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfMonth, endOfMonth];
    }

    case 'last_month': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return [lastMonthStart, lastMonthEnd];
    }

    case 'quarter': {
      const quarterStart = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        1
      );
      const quarterEnd = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3 + 3,
        0
      );
      return [quarterStart, quarterEnd];
    }

    case 'last_quarter': {
      const lastQuarterStart = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3 - 3,
        1
      );
      const lastQuarterEnd = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        0
      );
      return [lastQuarterStart, lastQuarterEnd];
    }

    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return [startOfYear, endOfYear];
    }

    case 'last_year': {
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
      return [lastYearStart, lastYearEnd];
    }

    case 'last_7_days': {
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return [last7Days, today];
    }

    case 'last_30_days': {
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return [last30Days, today];
    }

    case 'last_90_days': {
      const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return [last90Days, today];
    }

    default:
      return [today, today];
  }
};

/**
 * Check if date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is yesterday
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is yesterday
 */
export const isYesterday = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Check if date is this week
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is this week
 */
export const isThisWeek = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const [startOfWeek, endOfWeek] = getDateRange('week');

  return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

/**
 * Check if date is this month
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is this month
 */
export const isThisMonth = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const now = new Date();

  return (
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()
  );
};

/**
 * Check if date is this year
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is this year
 */
export const isThisYear = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  const now = new Date();

  return dateObj.getFullYear() === now.getFullYear();
};

/**
 * Add days to date
 * @param {Date|string|number} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date with added days
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Add months to date
 * @param {Date|string|number} date - Base date
 * @param {number} months - Number of months to add
 * @returns {Date} - New date with added months
 */
export const addMonths = (date, months) => {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
};

/**
 * Add years to date
 * @param {Date|string|number} date - Base date
 * @param {number} years - Number of years to add
 * @returns {Date} - New date with added years
 */
export const addYears = (date, years) => {
  const dateObj = new Date(date);
  dateObj.setFullYear(dateObj.getFullYear() + years);
  return dateObj;
};

/**
 * Get difference between dates in days
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} - Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);

  const timeDiff = Math.abs(dateObj2 - dateObj1);
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Get age from birthdate
 * @param {Date|string|number} birthdate - Birth date
 * @returns {number} - Age in years
 */
export const getAge = (birthdate) => {
  if (!birthdate) return 0;

  const birthdateObj = new Date(birthdate);
  if (isNaN(birthdateObj.getTime())) return 0;

  const today = new Date();

  let age = today.getFullYear() - birthdateObj.getFullYear();
  const monthDiff = today.getMonth() - birthdateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthdateObj.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Get start and end of day
 * @param {Date|string|number} date - Date
 * @returns {Array} - Array with start and end of day
 */
export const getStartEndOfDay = (date) => {
  const dateObj = new Date(date);

  const startOfDay = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  );
  const endOfDay = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    23,
    59,
    59,
    999
  );

  return [startOfDay, endOfDay];
};

/**
 * Get weekday name
 * @param {Date|string|number} date - Date
 * @param {boolean} short - Whether to return short name
 * @returns {string} - Weekday name
 */
export const getWeekdayName = (date, short = false) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const weekdays = short
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  return weekdays[dateObj.getDay()];
};

/**
 * Get month name
 * @param {Date|string|number} date - Date
 * @param {boolean} short - Whether to return short name
 * @returns {string} - Month name
 */
export const getMonthName = (date, short = false) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const months = short
    ? [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ]
    : [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月',
      ];

  return months[dateObj.getMonth()];
};

/**
 * Check if year is leap year
 * @param {number} year - Year to check
 * @returns {boolean} - True if leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Get days in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} - Number of days in month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Parse ISO date string to local date
 * @param {string} isoString - ISO date string
 * @returns {Date} - Local date object
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Error parsing ISO date: Invalid date string');
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
};

/**
 * Convert date to ISO string
 * @param {Date|string|number} date - Date to convert
 * @returns {string} - ISO date string
 */
export const toISOString = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Error converting to ISO string: Invalid date');
      return '';
    }
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return '';
  }
};

/**
 * Get timezone offset
 * @returns {number} - Timezone offset in minutes
 */
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

/**
 * Convert UTC to local time
 * @param {Date|string|number} utcDate - UTC date
 * @returns {Date} - Local date
 */
export const utcToLocal = (utcDate) => {
  if (!utcDate) return null;

  const dateObj = new Date(utcDate);
  const offset = getTimezoneOffset();

  return new Date(dateObj.getTime() - offset * 60 * 1000);
};

/**
 * Convert local time to UTC
 * @param {Date|string|number} localDate - Local date
 * @returns {Date} - UTC date
 */
export const localToUTC = (localDate) => {
  if (!localDate) return null;

  const dateObj = new Date(localDate);
  const offset = getTimezoneOffset();

  return new Date(dateObj.getTime() + offset * 60 * 1000);
};

export default {
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
};
